import { test } from 'node:test';
import assert from 'node:assert/strict';

// Deliberately failing (quality-controls task 2.2): proves both Node versions report on their own.
test('fails on purpose', () => {
  assert.fail('This branch must never be merged.');
});
