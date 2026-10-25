import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame } from '../../src/game/game.ts';
import { SAVE_VERSION, parseSave } from '../../src/game/save.ts';
import { boardOf, gameOf, patternBoard, playFrom, seeded } from './helpers.ts';

/** A valid save as plain data, for the tests to break one property at a time. */
function sample(): any {
  return {
    version: SAVE_VERSION,
    game: gameOf(boardOf(['11', '.2', '..3']), [{ cell: 9, color: 4 }, { cell: 1 + 9 * 4, color: 5 }], 30),
    best: 50,
  };
}

test('saves of played games come back unchanged', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const save = { version: SAVE_VERSION, game: playFrom(newGame(seeded(seed)), seed * 3, seed * 100), best: seed * 10 };
    assert.deepEqual(parseSave(JSON.stringify(save)), save);
  }
});

test('a finished game is a valid save', () => {
  const save = { version: SAVE_VERSION, game: { ...gameOf(patternBoard(), [], 1230), over: true }, best: 0 };
  assert.deepEqual(parseSave(JSON.stringify(save)), save);
});

test('text that is not JSON is rejected', () => {
  assert.throws(() => parseSave('{"version": 1,'), SyntaxError);
});

// Each case breaks one property of a valid save and names the problem the error must report.
const broken: [string, (save: any) => unknown, string][] = [
  ['null', () => null, 'not a save'],
  ['an array', () => [], 'not a save'],
  ['an extra key', (save) => ({ ...save, extra: 1 }), 'not a save'],
  ['a missing key', ({ version, game }) => ({ version, game }), 'not a save'],
  ['a renamed key', ({ version, game, best }) => ({ version, game, score: best }), 'not a save'],
  ['a later version', (save) => ({ ...save, version: 2 }), 'unknown version 2'],
  ['a version as text', (save) => ({ ...save, version: '1' }), 'unknown version "1"'],
  ['a negative best score', (save) => ({ ...save, best: -10 }), 'bad best score'],
  ['a best score off the 10s', (save) => ({ ...save, best: 15 }), 'bad best score'],
  ['a best score as text', (save) => ({ ...save, best: '50' }), 'bad best score'],
  ['no game', (save) => ({ ...save, game: null }), 'no game'],
  ['an extra game key', (save) => ({ ...save, game: { ...save.game, turn: 3 } }), 'no game'],
  ['a board that is not a list', (save) => ({ ...save, game: { ...save.game, board: {} } }), 'bad board'],
  ['a board of 80 cells', (save) => ({ ...save, game: { ...save.game, board: save.game.board.slice(1) } }), 'bad board'],
  ['a color above 7', (save) => withCell(save, 80, 8), 'bad board'],
  ['a negative cell value', (save) => withCell(save, 80, -1), 'bad board'],
  ['a fractional cell value', (save) => withCell(save, 80, 1.5), 'bad board'],
  ['a cell value as text', (save) => withCell(save, 80, '1'), 'bad board'],
  ['next balls that are not a list', (save) => withNext(save, {}), 'bad next balls'],
  ['4 next balls', (save) => withNext(save, [30, 31, 32, 33].map((cell) => ({ cell, color: 1 }))), 'bad next balls'],
  ['a next ball with an extra key', (save) => withNext(save, [{ cell: 30, color: 1, big: true }]), 'bad next balls'],
  ['a next ball off the board', (save) => withNext(save, [{ cell: 81, color: 1 }]), 'bad next balls'],
  ['a next ball on a negative cell', (save) => withNext(save, [{ cell: -1, color: 1 }]), 'bad next balls'],
  ['a next ball of color 0', (save) => withNext(save, [{ cell: 30, color: 0 }]), 'bad next balls'],
  ['a next ball of color 8', (save) => withNext(save, [{ cell: 30, color: 8 }]), 'bad next balls'],
  ['two next balls on one cell', (save) => withNext(save, [{ cell: 30, color: 1 }, { cell: 30, color: 2 }]), 'next balls share a cell'],
  ['a next ball on a ball', (save) => withNext(save, [{ cell: 0, color: 1 }]), 'a next ball is on a ball'],
  ['a negative score', (save) => ({ ...save, game: { ...save.game, score: -10 } }), 'bad score'],
  ['a score off the 10s', (save) => ({ ...save, game: { ...save.game, score: 35 } }), 'bad score'],
  ['a score beyond safe integers', (save) => ({ ...save, game: { ...save.game, score: 2 ** 60 } }), 'bad score'],
  ['game over on a board with room', (save) => ({ ...save, game: { ...save.game, over: true } }), 'game over does not match a full board'],
  ['a full board not over', (save) => ({ ...save, game: gameOf(patternBoard()) }), 'game over does not match a full board'],
  ['game over as text', (save) => ({ ...save, game: { ...save.game, over: 'false' } }), 'game over does not match a full board'],
  ['a line on the board', (save) => ({ ...save, game: gameOf(boardOf(['.....', '22222'])) }), 'a line is left on the board'],
];

for (const [name, breakIt, problem] of broken) {
  test(`a save with ${name} is rejected: ${problem}`, () => {
    assert.throws(() => parseSave(JSON.stringify(breakIt(sample()))), {
      message: `Saved game rejected: ${problem}`,
    });
  });
}

test('the sample itself is valid, so each rejection above comes from its one change', () => {
  assert.deepEqual(parseSave(JSON.stringify(sample())), sample());
});

function withCell(save: any, cell: number, value: unknown): unknown {
  const board = [...save.game.board];
  board[cell] = value;
  return { ...save, game: { ...save.game, board } };
}

function withNext(save: any, next: unknown): unknown {
  return { ...save, game: { ...save.game, next } };
}
