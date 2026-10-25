import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CELLS, SIZE, cellAt, column, inside, neighbours, row } from '../../src/game/board.ts';

test('the board has 9×9 cells, numbered row by row', () => {
  assert.equal(SIZE, 9);
  assert.equal(CELLS, 81);
  assert.equal(cellAt(2, 3), 21);
  assert.equal(row(21), 2);
  assert.equal(column(21), 3);
});

test('inside rejects every edge', () => {
  assert.equal(inside(0, 0), true);
  assert.equal(inside(-1, 0), false);
  assert.equal(inside(9, 0), false);
  assert.equal(inside(0, -1), false);
  assert.equal(inside(0, 9), false);
});

test('neighbours are up, down, left, right, without leaving the board', () => {
  assert.deepEqual(neighbours(40), [31, 49, 39, 41]);
  assert.deepEqual(neighbours(0), [9, 1]);
  assert.deepEqual(neighbours(80), [71, 79]);
});
