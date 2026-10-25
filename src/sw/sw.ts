// The service worker. It stores the game's files so the game opens offline, and makes every online
// load ask the server for newer files: GitHub Pages lets browsers reuse files for 10 minutes without
// asking, which could otherwise mix files from two deploys.
// It must stay one classic script without imports; test/offline.test.ts checks that.

// The worker library types `self` for any kind of worker; this file only ever runs as a service worker.
const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = 'lines';
/** The files to store, relative to this worker. test/offline.test.ts keeps the list complete. */
const FILE_LIST = 'offline-files.json';
/** Milliseconds to wait for the server to answer a page request before loading from the store. */
const TIMEOUT = 3000;

/** Whether the page loading now came from the store. Its files then come from there too, so they match. */
let pageFromStore = false;

sw.addEventListener('install', (event) => {
  // A new worker takes over at the next load rather than once every tab has closed. Old and new both
  // fetch fresh files, so they can't disagree about what a page gets.
  event.waitUntil(storeAll().then(() => sw.skipWaiting()));
});

sw.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== sw.location.origin) return;
  event.respondWith((request.mode === 'navigate' ? page(event) : file(request)).then(mustAskAgain));
});

/**
 * Stores every listed file, checked against the server, then forgets files no longer listed.
 * `addAll` stores all or nothing, so the store always holds one complete deploy.
 */
async function storeAll(): Promise<void> {
  const response = await fetch(FILE_LIST, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`${FILE_LIST}: ${response.status}`);
  const files: string[] = await response.json();
  const cache = await caches.open(CACHE);
  await cache.addAll(files.map((file) => new Request(file, { cache: 'no-cache' })));
  const listed = new Set(files.map((file) => new URL(file, sw.location.href).href));
  for (const stored of await cache.keys()) {
    if (!listed.has(stored.url)) await cache.delete(stored);
  }
}

/** The page from the server if it answers within TIMEOUT, otherwise from the store. */
async function page(event: FetchEvent): Promise<Response> {
  const network = fetch(event.request, { cache: 'no-cache' });
  // Once the server has answered, even late, refresh the store so the next offline load gets this deploy.
  // Failures need no handling here: the page is answered from the store below.
  event.waitUntil(network.then((response) => (response.ok ? storeAll() : undefined)).catch(() => undefined));
  try {
    const response = await Promise.race([network, timeout(TIMEOUT)]);
    pageFromStore = false;
    return response;
  } catch {
    const stored = await (await caches.open(CACHE)).match(event.request, { ignoreSearch: true });
    // Never stored: wait for the server after all.
    if (stored === undefined) return network;
    pageFromStore = true;
    return stored;
  }
}

/** A file the page needs, from the same place as the page; from the other one only when that fails. */
async function file(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  if (pageFromStore) return (await cache.match(request)) ?? fetch(request, { cache: 'no-cache' });
  try {
    return await fetch(request, { cache: 'no-cache' });
  } catch (error) {
    const stored = await cache.match(request);
    if (stored === undefined) throw error;
    return stored;
  }
}

/**
 * A copy of `response` that the browser must check with this worker before reusing. Otherwise Chrome's
 * in-memory cache reuses files for the 10 minutes GitHub Pages allows, without asking the worker.
 */
function mustAskAgain(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-cache');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function timeout(ms: number): Promise<never> {
  return new Promise((_resolve, reject) => setTimeout(() => reject(new Error(`No answer in ${ms} ms`)), ms));
}
