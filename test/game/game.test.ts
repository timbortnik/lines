import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CELLS, COLORS, EMPTY, cellAt } from '../../src/game/board.ts';
import { NEXT_BALLS, START_BALLS, move, newGame, points } from '../../src/game/game.ts';
import { balls, gameOf, hasLine, patternBoard, seeded, sequence } from './helpers.ts';

test('a new game: 81 cells, 5 balls in the 7 colors, score 0, 3 next balls on distinct empty cells, no line', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const game = newGame(seeded(seed));
    assert.equal(game.board.length, CELLS);
    assert.equal(balls(game.board).length, START_BALLS);
    for (const cell of balls(game.board)) assert.ok(game.board[cell] >= 1 && game.board[cell] <= COLORS);
    assert.equal(game.score, 0);
    assert.equal(game.over, false);
    assert.equal(game.next.length, NEXT_BALLS);
    assert.equal(new Set(game.next.map((ball) => ball.cell)).size, NEXT_BALLS);
    for (const ball of game.next) assert.equal(game.board[ball.cell], EMPTY);
    assert.equal(hasLine(game.board), false);
  }
});

test('a starting draw that forms a line is drawn again', () => {
  // All-zero draws put five balls of color 1 on cells 0–4: a line.
  const game = newGame(sequence(new Array<number>(10).fill(0), seeded(1)));
  assert.equal(balls(game.board).length, START_BALLS);
  assert.equal(hasLine(game.board), false);
  assert.notDeepEqual(balls(game.board), [0, 1, 2, 3, 4]);
});

test('only as many next balls as there are free cells', () => {
  // Full board except: the destination, three next balls, and one spare cell.
  const board = patternBoard();
  const next = [cellAt(0, 0), cellAt(0, 1), cellAt(0, 2)].map((cell) => ({ cell, color: board[cell] }));
  for (const cell of [cellAt(8, 8), cellAt(4, 4), ...next.map((ball) => ball.cell)]) board[cell] = EMPTY;
  const turn = move(gameOf(board, next), cellAt(8, 7), cellAt(8, 8), seeded(1));
  assert.ok(turn !== null);
  assert.deepEqual(turn.game.next.map((ball) => ball.cell).sort((a, b) => a - b), [cellAt(4, 4), cellAt(8, 7)]);
  assert.equal(turn.game.over, false);
  assert.deepEqual(turn.events.map((event) => event.type), ['moved', 'appeared', 'chosen']);
});

test('points double with each ball beyond five', () => {
  assert.equal(points(5), 10);
  assert.equal(points(6), 20);
  assert.equal(points(9), 160);
});
