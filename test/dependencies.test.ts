import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The project allows exactly these packages. Adding one means editing this list, so it shows up in review.
const ALLOWED_DEV_DEPENDENCIES = ['@types/node', 'typescript'];

const manifest: Record<string, unknown> = JSON.parse(readFileSync('package.json', 'utf8'));

test('devDependencies is the only dependency field', () => {
  const fields = Object.keys(manifest).filter((key) => /dependencies$/i.test(key));
  assert.deepEqual(fields, ['devDependencies']);
});

test('only the allowed development dependencies are listed', () => {
  const listed = Object.keys(manifest.devDependencies as Record<string, string>).sort();
  assert.deepEqual(listed, ALLOWED_DEV_DEPENDENCIES);
});
