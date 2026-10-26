import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY, cellAt } from '../../src/game/board.ts';
import { START_BALLS, move } from '../../src/game/game.ts';
import type { Game, Random, TurnEvent } from '../../src/game/game.ts';
import { balls, boardOf, gameOf, hasLine, patternBoard, seeded, sequence } from './helpers.ts';

const types = (events: TurnEvent[]): string[] => events.map((event) => event.type);
const NEXT = [
  { cell: cellAt(0, 0), color: 3 },
  { cell: cellAt(0, 1), color: 4 },
  { cell: cellAt(0, 2), color: 5 },
];

/** Plays a move that must be accepted. */
function play(game: Game, from: number, to: number, random: Random = seeded(1)) {
  const turn = move(game, from, to, random);
  assert.ok(turn !== null, 'the move should be accepted');
  return turn;
}

test('rejected moves return null and leave the game unchanged', () => {
  const board = boardOf(['', '', '', '....1', '...2.3', '....4', '', '', '7']);
  const game = gameOf(board, NEXT);
  const before = structuredClone(game);
  assert.equal(move({ ...game, over: true }, cellAt(8, 0), cellAt(8, 8), seeded(1)), null, 'game over');
  assert.equal(move(game, cellAt(7, 0), cellAt(8, 8), seeded(1)), null, 'empty origin');
  assert.equal(move(game, cellAt(8, 0), cellAt(3, 4), seeded(1)), null, 'occupied destination');
  assert.equal(move(game, cellAt(8, 0), cellAt(4, 4), seeded(1)), null, 'no route');
  assert.equal(move(game, cellAt(9, 4), cellAt(8, 8), seeded(1)), null, 'origin off the board');
  assert.deepEqual(game, before);
});

test('a route may cross a cell holding a next ball', () => {
  const board = boardOf(['2', '', '', '', '1234.5671']);
  const turn = play(gameOf(board, [{ cell: cellAt(4, 4), color: 3 }]), cellAt(0, 0), cellAt(8, 8));
  const moved = turn.events[0];
  assert.ok(moved.type === 'moved' && moved.path.includes(cellAt(4, 4)));
});

test('a next ball the moving ball lands on jumps to the cell the ball left and keeps its color', () => {
  const board = boardOf(['', '', '', '', '', '', '', '', '........1']);
  const next = [{ cell: cellAt(8, 7), color: 3 }, ...NEXT.slice(0, 2)];
  // A random jump with a first draw of 0 would take the lowest free cell, (0, 2), not the cell the ball left.
  const turn = play(gameOf(board, next), cellAt(8, 8), cellAt(8, 7), sequence([0], seeded(1)));
  assert.deepEqual(turn.events, [
    { type: 'moved', path: [cellAt(8, 8), cellAt(8, 7)] },
    { type: 'jumped', from: cellAt(8, 7), to: cellAt(8, 8), color: 3 },
    { type: 'appeared', balls: [{ cell: cellAt(8, 8), color: 3 }, ...NEXT.slice(0, 2)] },
    { type: 'chosen', balls: turn.game.next },
  ]);
  assert.equal(turn.game.board[cellAt(8, 8)], 3, 'it then appears there');
  assert.equal(turn.game.board[cellAt(8, 7)], 1);
});

test('a completed line of five is removed, scores 10, and gives a free move', () => {
  const board = boardOf(['........2', '', '', '', '1111', '', '', '', '........1']);
  const game = gameOf(board, NEXT, 7);
  const turn = play(game, cellAt(8, 8), cellAt(4, 4));
  assert.deepEqual(types(turn.events), ['moved', 'removed']);
  assert.equal(turn.game.score, 17);
  assert.deepEqual(turn.game.next, NEXT, 'the next balls stay put');
  assert.deepEqual(balls(turn.game.board), [cellAt(0, 8)]);
});

test('six balls score 20; four in a row removes nothing', () => {
  const six = play(gameOf(boardOf(['........2', '', '', '', '111.11', '', '', '', '........1']), NEXT), cellAt(8, 8), cellAt(4, 3));
  assert.equal(six.game.score, 20);
  const four = play(gameOf(boardOf(['........2', '', '', '', '111', '', '', '', '........1']), NEXT), cellAt(8, 8), cellAt(4, 3));
  assert.equal(four.game.score, 0);
  assert.deepEqual(types(four.events), ['moved', 'appeared', 'chosen']);
});

test('crossing lines are removed together: 9 balls score 160', () => {
  const board = boardOf(['........2', '', '1', '.1', '11.11', '...1', '....1', '', '........1']);
  const turn = play(gameOf(board, NEXT), cellAt(8, 8), cellAt(4, 2));
  const removed = turn.events[1];
  assert.ok(removed.type === 'removed');
  assert.equal(removed.cells.length, 9);
  assert.equal(removed.points, 160);
  assert.equal(turn.game.score, 160);
});

test('the board fills up: the game is over and further moves are rejected', () => {
  // Full board except two cells, both holding next balls. The moving ball lands on one of them,
  // which jumps to the cell the ball left; then both appear and nothing is free.
  const board = patternBoard();
  const next = [cellAt(8, 8), cellAt(0, 4)].map((cell) => ({ cell, color: board[cell] }));
  for (const ball of next) board[ball.cell] = EMPTY;
  const turn = play(gameOf(board, next), cellAt(8, 7), cellAt(8, 8));
  assert.equal(turn.game.over, true);
  assert.equal(turn.game.board.includes(EMPTY), false);
  assert.deepEqual(turn.game.next, []);
  assert.deepEqual(types(turn.events), ['moved', 'jumped', 'appeared', 'chosen', 'over']);
  assert.equal(move(turn.game, cellAt(0, 0), cellAt(0, 1), seeded(1)), null);
});

test('when the filling balls complete a line, it is removed and the game continues', () => {
  const board = patternBoard();
  for (const c of [1, 2, 3]) board[cellAt(0, c)] = 1; // row 0 now starts 1 1 1 1
  const next = [
    { cell: cellAt(8, 8), color: board[cellAt(8, 8)] },
    { cell: cellAt(0, 4), color: 1 },
  ];
  for (const ball of next) board[ball.cell] = EMPTY;
  const turn = play(gameOf(board, next), cellAt(8, 7), cellAt(8, 8));
  assert.equal(turn.game.over, false);
  assert.equal(turn.game.score, 10);
  assert.deepEqual(types(turn.events), ['moved', 'jumped', 'appeared', 'removed', 'chosen']);
  assert.equal(turn.game.next.length, 3);
});

test('a move that clears the board places 5 new balls, keeps the score and the next balls', () => {
  const board = boardOf(['', '', '', '', '1111', '', '', '', '........1']);
  const turn = play(gameOf(board, NEXT, 30), cellAt(8, 8), cellAt(4, 4));
  assert.deepEqual(types(turn.events), ['moved', 'removed', 'refilled']);
  assert.equal(turn.game.score, 40);
  assert.deepEqual(turn.game.next, NEXT);
  const placed = balls(turn.game.board);
  assert.equal(placed.length, START_BALLS);
  const refilled = turn.events[2];
  assert.ok(refilled.type === 'refilled');
  const shown = boardOf([]);
  for (const ball of refilled.balls) shown[ball.cell] = ball.color;
  assert.deepEqual(shown, turn.game.board, 'the record lists exactly the balls placed');
  for (const ball of NEXT) assert.ok(!placed.includes(ball.cell), 'not on a next ball');
  assert.equal(hasLine(turn.game.board), false);
});

test('appearing balls that clear the board lead to 5 new balls, then new next balls', () => {
  const board = boardOf(['111', '', '', '', '', '.....1']);
  const turn = play(gameOf(board, [{ cell: cellAt(0, 4), color: 1 }]), cellAt(5, 5), cellAt(0, 3));
  assert.deepEqual(types(turn.events), ['moved', 'appeared', 'removed', 'refilled', 'chosen']);
  assert.equal(turn.game.score, 10);
  assert.equal(balls(turn.game.board).length, START_BALLS);
  assert.equal(turn.game.next.length, 3);
  for (const ball of turn.game.next) assert.equal(turn.game.board[ball.cell], EMPTY);
});
