import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../../src/game/game.ts';
import type { Game } from '../../src/game/game.ts';
import { NEW_GAME_HISTORY, RESUMED_HISTORY, afterMove, undo } from '../../src/game/undo.ts';
import type { History } from '../../src/game/undo.ts';
import { playFrom, seeded } from './helpers.ts';

/** Two distinct games, the second one move after the first. */
const [first, second] = [0, 1].map((turns) => playFrom(newGame(seeded(1)), turns, 10));

/** Undoes the last move, which must be possible. */
function undone(history: History): { game: Game; history: History } {
  const result = undo(history);
  assert.ok(result !== null, 'undo should be possible');
  return result;
}

test('a new game has nothing to undo', () => {
  assert.equal(undo(NEW_GAME_HISTORY), null);
});

test('undo gives back the game before the last move, and only that one', () => {
  const history = afterMove(afterMove(NEW_GAME_HISTORY, first), second);
  const result = undone(history);
  assert.equal(result.game, second);
  assert.equal(undo(result.history), null, 'nothing more to undo');
});

test('a move right after an undo cannot be undone, and the move after it can', () => {
  const afterUndo = undone(afterMove(NEW_GAME_HISTORY, first)).history;
  const retried = afterMove(afterUndo, first);
  assert.equal(undo(retried), null, 'the retried move stands');
  assert.equal(undone(afterMove(retried, second)).game, second);
});

test("a resumed game's first move cannot be undone, and its second can", () => {
  assert.equal(undo(RESUMED_HISTORY), null, 'nothing to undo on opening');
  const afterFirst = afterMove(RESUMED_HISTORY, first);
  assert.equal(undo(afterFirst), null, 'the first move stands');
  assert.equal(undone(afterMove(afterFirst, second)).game, second);
});

test("a new game's first move can be undone", () => {
  assert.equal(undone(afterMove(NEW_GAME_HISTORY, first)).game, first);
});
