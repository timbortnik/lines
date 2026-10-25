import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY } from '../../src/game/board.ts';
import { move, newGame } from '../../src/game/game.ts';
import type { Game } from '../../src/game/game.ts';
import { findPath } from '../../src/game/path.ts';
import { seeded } from './helpers.ts';

/** The first legal move found, scanning origins and destinations in cell order. */
function firstMove(game: Game): [number, number] {
  for (let from = 0; from < game.board.length; from++) {
    if (game.board[from] === EMPTY) continue;
    for (let to = 0; to < game.board.length; to++) {
      if (game.board[to] === EMPTY && findPath(game.board, from, to) !== null) return [from, to];
    }
  }
  throw new Error('no legal move');
}

/** Plays `turns` first-found moves, with a fresh seed for each. */
function playFrom(game: Game, turns: number, seed: number): Game {
  for (let i = 0; i < turns && !game.over; i++) {
    const [from, to] = firstMove(game);
    game = move(game, from, to, seeded(seed + i))!.game;
  }
  return game;
}

test('the same state, move and random numbers give identical results', () => {
  const game = newGame(seeded(5));
  const [from, to] = firstMove(game);
  assert.deepEqual(move(game, from, to, seeded(9)), move(game, from, to, seeded(9)));
});

test('move never changes its input', () => {
  const game = playFrom(newGame(seeded(2)), 12, 100);
  const before = structuredClone(game);
  const [from, to] = firstMove(game);
  move(game, from, to, seeded(3));
  assert.deepEqual(game, before);
});

test('a game state survives a JSON round trip, and play continues identically from it', () => {
  const game = playFrom(newGame(seeded(3)), 20, 200);
  const copy: Game = JSON.parse(JSON.stringify(game));
  assert.deepEqual(copy, game);
  assert.deepEqual(playFrom(copy, 10, 300), playFrom(game, 10, 300));
});
