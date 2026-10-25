# Proposal

## Why

The project's goal is a game that can be installed and played offline after the first visit. Today it can't: without a network it shows the browser's error page, and nothing describes it as an app. Also, GitHub Pages lets browsers reuse every file for 10 minutes without asking, which after the `playable-board` deploy gave a returning visitor a new page with an old script and a broken game until a force-refresh. Pages doesn't let us change that header.

## What Changes

- **An app manifest and icons**, so browsers offer to install the game and show it with its own icon in its own window. The page gets an icon, which also ends the browser's `/favicon.ico` 404.
  - The icon is drawn once as an SVG: a glossy ball on a game cell.
  - PNG sizes are made from it with headless Chrome, using a command documented in the README, and committed.
- **A hand-written service worker**, network first:
  - **Online:** every load asks the server whether files changed, using the ETags Pages already sends, so a page always gets the files of one deploy, and the latest.
  - **Offline, or no answer within 3 seconds:** files come from the cache, so the game opens and plays, saving included.
  - **First visit:** the worker downloads every file the game needs on install, so offline play works from then on.
- **The service worker is TypeScript** with its own small tsconfig, since it needs the worker types instead of the page types. It compiles to `site/sw.js`; `npm run build` runs `tsc` twice.
- **Guard tests:**
  - the list of files kept for offline use must match the site's files;
  - the service worker must stay one self-contained file;
  - the relative-URL guard learns the manifest and the file list.

## Capabilities

### New Capabilities

- `offline-app`: installing the game, playing it offline after the first visit, and getting the latest files on every online load.

### Modified Capabilities

- `site-delivery`: the "Relative URLs only" requirement also covers the manifest and the offline file list.

## Out of Scope

- **An in-page Install button.** The browser event behind it is Chromium-only. Browsers offer installing through their own menus. Chrome also needs a service worker that answers requests before it shows its automatic install prompt, and this change provides one.
- **"Update available" prompts, push notifications and background sync.** Network first makes the next load show a new deploy without any prompt.
- **Reading saves written by a newer save format.** That belongs to the change that first alters the format. That change must never overwrite a save it can't read, since a force-refresh or an offline load can run older code than the code that wrote the save.
- **Offline play over plain HTTP on a local network**, as used for phone testing. Browsers allow service workers only on HTTPS and localhost.

## Impact

- **New files:**
  - `src/sw/sw.ts` and `src/sw/tsconfig.json`;
  - `site/manifest.webmanifest` and `site/offline-files.json`;
  - `site/icons/*.png`, made from `icons/icon.svg`;
  - `test/offline.test.ts`.
- **Changed files:**
  - `tsconfig.json` (leaves out `src/sw`), the `build` script, `.gitignore` (`site/sw.js`);
  - `src/main.ts` (registers the worker), `site/index.html` (manifest and icon links);
  - `test/site.test.ts`, the README.
- **Dependencies:** none added. Headless Chrome is used once to draw the PNGs and isn't needed to build or test.
