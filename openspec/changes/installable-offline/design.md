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
  - Alternative considered: a module worker. Its `{ type: 'module' }` support is not confirmed as Baseline widely available, and nothing here needs to share code with the page.

### 3. What the worker does

- **On install:** reads `offline-files.json` and stores every listed file in one cache, `lines`, with `cache: 'reload'` so it bypasses the browser's 10-minute cache. `cache.addAll` stores all or nothing, so a failed install leaves the old set intact and retries on a later load. Then it calls `skipWaiting()`, so a new worker takes over at the next load instead of after every tab closes. That's safe because both old and new workers fetch fresh files.
- **On activate:** deletes stored entries no longer in the list.
- **On fetch**, for same-origin GET requests:
  1. It fetches from the network with `cache: 'no-cache'`, which always revalidates with the server, using the ETags.
  2. A successful answer is stored and returned.
  3. If the network fails, or doesn't answer within 3 seconds, the stored copy is returned (matching with `ignoreSearch`). The network request keeps running, kept alive by `event.waitUntil`, and updates the store when it answers.
  4. With nothing stored, it waits for the network after all.
- **Other origins and non-GET requests** pass through untouched. The game makes none today.

Alternatives considered:
- Cache first with a version stamp: rejected by the maintainer, as it needs a build step and a guarded stamp.
- Stale-while-revalidate: refreshes file by file without a version, so it can bring back the old-and-new mix.

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
- **The README documents the redraw**, at each size:

  ```sh
  google-chrome --headless --screenshot=site/icons/icon-512.png --window-size=512,512 icons/icon.svg
  ```

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
- a simulated deploy within the 10 minutes;
- a server answering after 5 seconds;
- no `/favicon.ico` request.

## Risks / Trade-offs

- **On a slow network, some files could come from the server and others from the store.** If a deploy happened since the last visit, that is a mix → it needs both a slow network and a recent deploy, and a reload fixes it. On a uniformly slow connection all files time out alike.
- **A service worker registered on `localhost:8000` stays for that address.** Another project served there later would pass through it → it only answers from its store when the network fails. The README mentions unregistering it in the browser's site settings.
- **Every online load makes about a dozen revalidation requests** → each is a `304` with no body, over one connection.
- **The first visit isn't controlled by the worker**, so its own files load the usual way → the install step downloads the whole list anyway.
