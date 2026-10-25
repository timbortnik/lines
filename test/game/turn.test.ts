import { test } from 'node:test';
import assert from 'node:assert/strict';
import { move, newGame } from '../../src/game/game.ts';
import type { Game } from '../../src/game/game.ts';
import { firstMove, playFrom, seeded } from './helpers.ts';

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
