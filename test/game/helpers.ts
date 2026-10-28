// Shared fixtures for the rules tests.

import { CELLS, COLORS, EMPTY, cellAt } from '../../src/game/board.ts';
import { move } from '../../src/game/game.ts';
import type { Ball, Game, Random } from '../../src/game/game.ts';
import { findLines } from '../../src/game/lines.ts';
import { findPath } from '../../src/game/path.ts';

/** A deterministic stand-in for Math.random (mulberry32). */
export function seeded(seed: number): Random {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Returns `values` in order, then continues with `rest`. */
export function sequence(values: number[], rest: Random): Random {
  let i = 0;
  return () => (i < values.length ? values[i++] : rest());
}

/** A board from up to 9 rows of up to 9 characters: '.' is empty, '1'–'6' are colors. */
export function boardOf(rows: string[]): number[] {
  const board = new Array<number>(CELLS).fill(EMPTY);
  rows.forEach((line, r) => {
    [...line].forEach((ch, c) => {
      if (ch !== '.') board[cellAt(r, c)] = Number(ch);
    });
  });
  return board;
}

/** A full board on which no two neighbours, in any of the 4 directions, share a color. */
export function patternBoard(): number[] {
  return Array.from({ length: CELLS }, (_, cell) => ((Math.floor(cell / 9) * 3 + (cell % 9)) % COLORS) + 1);
}

export function gameOf(board: number[], next: Ball[] = [], score = 0): Game {
  return { board, next, score, over: false };
}

export function balls(board: readonly number[]): number[] {
  return board.flatMap((color, cell) => (color === EMPTY ? [] : [cell]));
}

export function hasLine(board: readonly number[]): boolean {
  return findLines(board, balls(board)).length > 0;
}

/** The first legal move found, scanning origins and destinations in cell order. */
export function firstMove(game: Game): [number, number] {
  for (let from = 0; from < game.board.length; from++) {
    if (game.board[from] === EMPTY) continue;
    for (let to = 0; to < game.board.length; to++) {
      if (game.board[to] === EMPTY && findPath(game.board, from, to) !== null) return [from, to];
    }
  }
  throw new Error('no legal move');
}

/** Plays `turns` first-found moves, with a fresh seed for each. */
export function playFrom(game: Game, turns: number, seed: number): Game {
  for (let i = 0; i < turns && !game.over; i++) {
    const [from, to] = firstMove(game);
    game = move(game, from, to, seeded(seed + i))!.game;
  }
  return game;
}
