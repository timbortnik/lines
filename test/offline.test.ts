import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// Guards for the service worker in src/sw/: the list of files it stores for offline play, and its form.

const SITE = 'site';
/** Top-level site entries that aren't listed: the page (listed as "./"), compiled output, the list itself. */
const UNLISTED = new Set(['index.html', 'js', 'sw.js', 'sw.js.map', 'offline-files.json']);

/** Every file under `dir`, as a slash-separated path relative to `dir`. */
function filesIn(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'));
}

test('the offline file list names exactly the files the game needs', () => {
  const listed: string[] = JSON.parse(readFileSync(join(SITE, 'offline-files.json'), 'utf8'));
  const statics = filesIn(SITE).filter((path) => !UNLISTED.has(path.split('/')[0]));
  // Modules come from src/, not site/js/: the compiler never deletes old output.
  const modules = filesIn('src')
    .filter((path) => !path.startsWith('sw/'))
    .map((path) => `js/${path.replace(/\.ts$/, '.js')}`);
  assert.deepEqual([...listed].sort(), ['./', ...statics, ...modules].sort());
});

test('the service worker is one classic script, without imports or exports', () => {
  assert.deepEqual(readdirSync('src/sw').sort(), ['sw.ts', 'tsconfig.json']);
  assert.doesNotMatch(readFileSync('src/sw/sw.ts', 'utf8'), /^\s*(?:import|export)\b/m);
});
