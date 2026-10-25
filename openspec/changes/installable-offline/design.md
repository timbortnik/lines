# Design

## Context

The site is static files on GitHub Pages. Pages answers every file with `cache-control: max-age=600` and a working ETag (checked: an `If-None-Match` request gets `304`), and doesn't let us change headers. `src/` compiles to `site/js/` with the DOM types; the rules and UI load as ES modules from `index.html`. See proposal.md for the motivation and the specs for the behaviour. The maintainer chose network first over cache first, and TypeScript for the service worker.

## Goals / Non-Goals

**Goals:**
- Offline play after the first visit, and never a mix of two deploys when online.
- No version stamp or other build step to maintain, beyond a second `tsc` run.

**Non-Goals:**
- Instant start from the cache when online; each online load pays one round of small revalidation requests.
- Prompting players about updates.

## Decisions

### 1. Files

```
icons/icon.svg              the icon's source (not published)
site/icons/icon-192.png     drawn from it with headless Chrome, committed
site/icons/icon-512.png     also used as the maskable icon
site/manifest.webmanifest   the app manifest
site/offline-files.json     the files the service worker stores on install
src/sw/sw.ts                the service worker → site/sw.js (git-ignored, like site/js/)
src/sw/tsconfig.json        its compiler settings
test/offline.test.ts        guards for the file list and the worker
```

### 2. Compiling the worker

Verified with TypeScript 7.0.2 in the scratchpad:
- **Its own tsconfig.** One tsconfig with both the `dom` and `webworker` libraries fails with clashing declarations. `src/sw/tsconfig.json` extends the root one, so it keeps every strict check, and overrides:
  - `lib: ["es2023", "webworker"]`;
  - `module: "esnext"` with `moduleResolution: "bundler"`: under the root's `nodenext`, `package.json`'s `"type": "module"` would make the file a module and add `export {}`, which a classic worker can't run;
  - `rootDir: "."` and `outDir: "../../site"`.
- **The root tsconfig leaves out `src/sw`**, and `npm run build` becomes `tsc -p . && tsc -p src/sw`.
- **One cast:** `self as unknown as ServiceWorkerGlobalScope`. The worker library types `self` for any kind of worker.
- **A classic script with no imports.** A worker can only control pages at or below its own folder, and Pages can't send the header that widens that, so it must be `site/sw.js`. A guard test fails if the source gains an `import` or `export`.
  - Alternative considered: a module worker. Module workers have been Baseline only since January 2026, so not yet widely available, and nothing here needs to share code with the page.

### 3. What the worker does

**The rule:** a page load takes all its files from one place, either the server or the store, and the store is only ever replaced as a whole set.

- **The store** is one cache, `lines`. Only `storeAll()` writes it:
  - it reads `offline-files.json` and `cache.addAll`s every listed file with `cache: 'no-cache'`, so each is checked against the server through its ETag;
  - `addAll` stores all or nothing, so an interrupted refresh leaves the previous complete set;
  - then it deletes entries no longer listed.
- **On install:** `storeAll()`, then `skipWaiting()`. A new worker takes over at the next load instead of after every tab closes. That's safe because old and new workers both fetch fresh files.
- **Page requests** (`mode: 'navigate'`):
  - **The server answers within 3 seconds, without an error:** its answer is returned, `pageFromStore = false`, and `storeAll()` refreshes the store in the background (`event.waitUntil`), so the next offline load gets this deploy.
  - **The server fails, answers with an error, or is slower:** the stored page is returned, and `pageFromStore = true`. A late answer still triggers the refresh.
  - **Nothing is stored yet:** it waits for the server after all.
- **Other requests from the page:**
  - when `pageFromStore` is set, from the store, with the server only for something not stored;
  - otherwise from the server with `cache: 'no-cache'`, with no timeout, and the store only when the server fails.
- **The worker fetches by URL, not with the page's request** (`fresh()`). Measured in headless Chrome: while starting an idle worker for a page load, Chrome requests the page itself, allowing its 10-minute cache, and hands that answer to `fetch(event.request)`, ignoring `cache: 'no-cache'`. A player returning within 10 minutes of a deploy got the old `index.html` with the new scripts. Fetching by URL also follows the server's redirects, which a page request would leave to the browser.
- **Every response the worker returns is marked `Cache-Control: no-cache`.** Measured in headless Chrome: without this, Chrome's in-memory cache reused the previous load's files for a reload in the same tab within the 10 minutes, without asking the worker. The page then mixed a new `index.html` with old scripts.
- **Other origins and non-GET requests** pass through untouched. The game makes none.

Why one place per load:
- **Waits don't add up.** The modules load in about 4 waves, one import level each. With a timeout per file, a slow server would cost about 4 × 3 seconds; deciding once at the page costs 3 seconds in all (measured: 3.3 s with a 5-second server).
- **Old and new files never mix.** Storing files one by one as they're fetched would leave the store half updated whenever a load is interrupted.

`pageFromStore` is one value for the whole worker. Two tabs loading at the same moment could share it; the cost is at worst one load from the store while online.

Alternatives considered:
- Cache first with a version stamp: rejected by the maintainer, as it needs a build step and a guarded stamp.
- Stale-while-revalidate: refreshes file by file without a version, so it can bring back the old-and-new mix.
- Matching each file to its page through `FetchEvent.resultingClientId`: precise, but its support across browsers isn't confirmed.

### 4. The offline file list

`site/offline-files.json` is a JSON array of URLs relative to the worker: `"./"` for the page, then `style.css`, `manifest.webmanifest`, the icons, and every `js/` module.

- It's data, not code, so the worker fetches it and the guard reads it without parsing TypeScript.
- **The guard computes the expected list:**
  - `"./"`;
  - every file under `site/` except `index.html` (served as `"./"`), the compiled `js/` folder, `sw.js` and its map, and `offline-files.json` itself;
  - one `js/….js` for every `.ts` under `src/` outside `src/sw/`.

  It works from `src/`, not `site/js/`, because `tsc` never deletes old output and the test build doesn't compile the browser code.
- Alternative considered: a list inside `sw.ts`. The guard would have to parse source text, since it can't import a worker script.

### 5. Registering the worker

`main.ts`, at the end of start-up:

```ts
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(warn)
else warn(...)  // e.g. plain HTTP on a local network
```

- The URL is relative, so the scope is the site's folder at any path.
- The default `updateViaCache` already makes the browser fetch `sw.js` itself past its cache when checking for updates.

### 6. Manifest and icons

- **The manifest:**

  ```json
  {
    "id": "./",
    "name": "Lines",
    "short_name": "Lines",
    "start_url": "./",
    "scope": "./",
    "display": "standalone",
    "background_color": "#2b2b2b",
    "theme_color": "#2b2b2b",
    "icons": [
      { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
      { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]
  }
  ```

  `id` is fixed now, so later edits to `start_url` don't make browsers treat it as a different app.
- **The icon is full-bleed:** a dark background, with a game cell and a ball inside the central circle that masking keeps. So one image serves both as a plain and as a maskable icon.
- **`index.html` gets** `<link rel="manifest">` and `<link rel="icon" href="icons/icon-192.png">`.
- **The README documents the redraw.**

### 7. Relative-URL guard

`test/site.test.ts`:
- skips the compiled `sw.js` and its map, like `js/`;
- gains finders for:
  - `.webmanifest`: `id`, `start_url`, `scope` and icon `src`;
  - `.json`: the strings of the offline list;
  - `.png`: none, since images hold no URLs.

Any other new file type still fails until it's taught.

### 8. Checking

A throwaway scratchpad server mimics Pages: `max-age=600` and ETags, optional delays, and it can be stopped. Driving headless Chrome over the DevTools protocol, the check covers:
- the installability errors (`Page.getInstallabilityErrors`) and the parsed manifest;
- offline play after one visit, with the server stopped;
- a simulated deploy within the 10 minutes that changes `index.html` as well as scripts, in the same tab, in a restarted browser and with the worker stopped, with a control run that bypasses the worker and keeps the old files;
- a server answering after 5 seconds;
- plain HTTP on a LAN address;
- no `/favicon.ico` request.

## Risks / Trade-offs

- **The first visit isn't controlled by the worker**, so its files load the usual way, and Chrome may reuse them from memory for 10 minutes in that tab → this only matters for a deploy within the first 10 minutes of someone's first visit. The install downloads the whole list anyway, so offline play is ready.
- **The store can still mix deploys in narrow races:** a deploy that lands during a refresh, two refreshes overlapping across a deploy, or a late answer refreshing the store while a page loaded from it is still loading → each needs a deploy within the seconds a refresh takes; the next online load refreshes the store again.
- **A network failure halfway through an online load** answers the failed files from the store, which can be the previous deploy → it needs a dropped connection mid-load right after a deploy, and a reload fixes it.
- **A service worker registered on `localhost:8000` stays for that address.** Another project served there later passes through it → it only answers from its store when the server fails. The README says how to remove it.
- **Every online load makes about two dozen small requests:** the page's own revalidations plus the background store refresh. Each is a `304` with no body, over one connection.
- **The worker rewrites response headers** → only `Cache-Control`, and only on what it hands the page; the stored copies keep the server's headers.
