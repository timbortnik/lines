import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cellAt } from '../../src/game/board.ts';
import { findLines } from '../../src/game/lines.ts';
import { boardOf } from './helpers.ts';

const sorted = (cells: number[]): number[] => [...cells].sort((a, b) => a - b);

test('a horizontal line of five', () => {
  const board = boardOf(['', '', '..11111']);
  assert.deepEqual(sorted(findLines(board, [cellAt(2, 4)])), [20, 21, 22, 23, 24]);
});

test('a vertical line of five', () => {
  const board = boardOf(['3', '3', '3', '3', '3']);
  assert.deepEqual(sorted(findLines(board, [cellAt(0, 0)])), [0, 9, 18, 27, 36]);
});

test('lines along both diagonals', () => {
  const down = boardOf(['2', '.2', '..2', '...2', '....2']);
  assert.equal(findLines(down, [cellAt(2, 2)]).length, 5);
  const up = boardOf(['....4', '...4', '..4', '.4', '4']);
  assert.equal(findLines(up, [cellAt(0, 4)]).length, 5);
});

test('four in a row is not a line, and other colors break a line', () => {
  assert.deepEqual(findLines(boardOf(['1111']), [0]), []);
  assert.deepEqual(findLines(boardOf(['11211']), [0]), []);
});

test('a longer line is removed whole', () => {
  assert.equal(findLines(boardOf(['666666']), [cellAt(0, 2)]).length, 6);
});

test('crossing lines through one cell count each ball once', () => {
  const board = boardOf(['..5', '..5', '55555', '..5', '..5']);
  assert.equal(findLines(board, [cellAt(2, 2)]).length, 9);
});

test('lines through several given cells are each found once', () => {
  const board = boardOf(['11111', '', '22222']);
  assert.equal(findLines(board, [cellAt(0, 0), cellAt(0, 4), cellAt(2, 1)]).length, 10);
});
