import { test } from 'node:test';
import assert from 'node:assert/strict';

// Deliberately failing (project-setup task 3.3): proves a failing check blocks the merge.
test('fails on purpose', () => {
  assert.fail('This branch must never be merged.');
});
