import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CELLS, EMPTY, cellAt, neighbours } from '../../src/game/board.ts';
import { findPath } from '../../src/game/path.ts';
import { boardOf } from './helpers.ts';

const emptyBoard = (): number[] => new Array<number>(CELLS).fill(EMPTY);

// Column 4 is a wall of balls except at the bottom row.
const WALL = ['....1', '....2', '....3', '....4', '....5', '....6', '....1', '....2'];

test('a shortest route across an empty board', () => {
  assert.deepEqual(findPath(emptyBoard(), cellAt(0, 0), cellAt(0, 3)), [0, 1, 2, 3]);
  assert.equal(findPath(emptyBoard(), cellAt(0, 0), cellAt(8, 8))?.length, 17);
});

test('a route steps between orthogonal neighbours through empty cells only', () => {
  const board = boardOf(WALL);
  const path = findPath(board, cellAt(0, 0), cellAt(0, 8));
  assert.ok(path !== null);
  assert.equal(path[0], cellAt(0, 0));
  assert.equal(path.at(-1), cellAt(0, 8));
  assert.ok(path.includes(cellAt(8, 4)), 'the only gap in the wall');
  for (let i = 1; i < path.length; i++) {
    assert.ok(neighbours(path[i - 1]).includes(path[i]));
    assert.equal(board[path[i]], EMPTY);
  }
});

test('a walled-off cell has no route', () => {
  const board = boardOf(['', '', '', '....1', '...2.3', '....4']);
  assert.equal(findPath(board, cellAt(0, 0), cellAt(4, 4)), null);
});

test('the same route every time', () => {
  const board = boardOf(WALL);
  assert.deepEqual(findPath(board, cellAt(0, 0), cellAt(0, 8)), findPath(board, cellAt(0, 0), cellAt(0, 8)));
});
