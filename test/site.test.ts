import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

// Guards the "relative URLs only" rule for everything published from site/.
// site/js/ is skipped because it is compiled from src/.

const SITE = 'site';
const COMPILED = join(SITE, 'js');

function siteFiles(dir = SITE): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (path === COMPILED) return [];
    return entry.isDirectory() ? siteFiles(path) : [path];
  });
}

// URLs in src and href attributes, in double or single quotes, and in url(...) in the page's own CSS.
function htmlUrls(html: string): string[] {
  const attributes = [...html.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
  const styles = [...html.matchAll(/\burl\(\s*(["']?)(.*?)\1\s*\)/gi)].map((match) => match[2]);
  return [...attributes, ...styles];
}

// In CSS outside comments, every quoted string and every unquoted url(...) value. Taking every
// string also covers @import and image-set(); a string that merely looks like a URL fails too.
function cssUrls(css: string): string[] {
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const strings = [...code.matchAll(/(["'])(.*?)\1/g)].map((match) => match[2]);
  const bare = [...code.matchAll(/\burl\(\s*([^"'\s)]+)\s*\)/gi)].map((match) => match[1]);
  return [...strings, ...bare];
}

// Each file type the site may contain, with how to find the URLs in it.
const urlFinders: Record<string, (text: string) => string[]> = {
  '.html': htmlUrls,
  '.css': cssUrls,
};

test('the site has a home page', () => {
  assert.ok(siteFiles().includes(join(SITE, 'index.html')));
});

test('site files refer to other files with relative URLs only', () => {
  for (const file of siteFiles()) {
    const findUrls = urlFinders[extname(file)];
    assert.ok(findUrls, `${file}: no URL check for this file type yet; add one to test/site.test.ts`);
    for (const url of findUrls(readFileSync(file, 'utf8'))) {
      assert.doesNotMatch(url, /^(?:\/|[a-z][a-z\d+.-]*:)/i, `${file}: "${url}" is not a relative URL`);
    }
  }
});
