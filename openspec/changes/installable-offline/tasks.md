# Tasks

## 1. Installable

- [x] 1.1 Draw `icons/icon.svg`, make `site/icons/icon-192.png` and `icon-512.png` from it with headless Chrome, add `site/manifest.webmanifest` and the manifest and icon links in `index.html` (design §6), and teach the URL guard `.webmanifest` and `.png` (design §7). Verify: `npm test` passes; the guard fails on an absolute icon `src` and on a root-relative `start_url`; headless Chrome reports no installability errors, parses the manifest with all three icons, and requests no `/favicon.ico`.
  - Done 2026-10-25: Chrome reports no installability or manifest errors and no `/favicon.ico` request; the guard checks every JSON string (fail closed) and fails on an absolute icon, a root `start_url` and an unknown field holding `/play`; the bevel is drawn as mitered polygons.

## 2. Offline

- [x] 2.1 Add the service worker build (design §2): `src/sw/tsconfig.json`, the root tsconfig's exclusion, the `build` script, `.gitignore`. Add `src/sw/sw.ts` (design §3), `site/offline-files.json` (design §4), and registration in `src/main.ts` (design §5). Add `test/offline.test.ts` for the file list and the no-imports rule, and teach the URL guard `.json` and to skip `sw.js` (design §7). Verify:
  - `npm run build` emits `site/sw.js` without `export`;
  - the guards fail on a missing, an extra and an absolute list entry, and on an `import` in `sw.ts`;
  - headlessly against the Pages-like server (design §8):
    - after one visit, the game loads, resumes and saves with the server stopped;
    - a file changed within the 10 minutes is served new on the next load, in the same tab and in a new browser;
    - with 5-second answers the page loads from the store in about 3 seconds;
    - over plain HTTP on a LAN address the game plays and the console notes offline play is unavailable.
  - Done 2026-10-25: all checks pass, plus an offline load after a deploy and an interrupted store refresh; the guards fail 7 ways. Testing reshaped the worker (design §3): the page request alone picks server or store, the store refreshes only as a whole set, and responses are marked no-cache, after Chrome's in-memory cache served old files to same-tab reloads.

## 3. Documentation

- [x] 3.1 Update the README: installing and offline play in the intro, the two-step build, redrawing the icons, and that offline play needs HTTPS or localhost (with how to remove a localhost worker). Verify: the commands run as written.
  - Done 2026-10-25: intro, build, offline needs HTTPS or localhost (and how to unregister), guards and an Icons section; both icon commands reproduce the committed PNGs byte for byte, and `npx tsc -p src/sw` builds.

## 4. Review and archive

- [ ] 4.1 Run the pre-review skill once on the whole branch, in a fresh read-only subagent, and apply the fixes the maintainer agrees to. Verify: findings and fixes are recorded for the pull request description.
- [ ] 4.2 Archive the change, syncing its specs. Verify: `openspec validate --specs` passes and `openspec list` shows no active change.
