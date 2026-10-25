// The saved form of a game, and the checks a save must pass before play resumes from it.
// Storing the text is the UI's job; this module only reads and checks it.

import { CELLS, COLORS, EMPTY } from './board.ts';
import { NEXT_BALLS } from './game.ts';
import type { Ball, Game } from './game.ts';
import { findLines } from './lines.ts';

/** The save format. A change to it bumps this, so older saves are rejected rather than misread. */
export const SAVE_VERSION = 1;

export interface Save {
  version: typeof SAVE_VERSION;
  /** The game in progress, or the last one if it ended. */
  game: Game;
  /** The highest score of the games that ended before `game`. */
  best: number;
}

/** Reads a save from its JSON text. Throws an Error that names the first problem found. */
export function parseSave(text: string): Save {
  const save: unknown = JSON.parse(text);
  check(hasKeys(save, ['version', 'game', 'best']), 'not a save');
  check(save.version === SAVE_VERSION, `unknown version ${JSON.stringify(save.version)}`);
  check(isScore(save.best), 'bad best score');
  return { version: SAVE_VERSION, game: parseGame(save.game), best: save.best };
}

function parseGame(game: unknown): Game {
  check(hasKeys(game, ['board', 'next', 'score', 'over']), 'no game');
  const { board, next, score, over } = game;
  check(Array.isArray(board) && board.length === CELLS && board.every(isCellValue), 'bad board');
  check(Array.isArray(next) && next.length <= NEXT_BALLS && next.every(isBall), 'bad next balls');
  const nextCells = next.map((ball) => ball.cell);
  check(new Set(nextCells).size === nextCells.length, 'next balls share a cell');
  check(nextCells.every((cell) => board[cell] === EMPTY), 'a next ball is on a ball');
  check(isScore(score), 'bad score');
  check(over === !board.includes(EMPTY), 'game over does not match a full board');
  // `move` only looks for lines through the cells that change, so a line already there would stay.
  const balls = board.flatMap((color, cell) => (color === EMPTY ? [] : [cell]));
  check(findLines(board, balls).length === 0, 'a line is left on the board');
  return { board, next, score, over };
}

function check(condition: boolean, problem: string): asserts condition {
  if (!condition) throw new Error(`Saved game rejected: ${problem}`);
}

/** True for an object with exactly these own keys. Parsed JSON arrays never have them. */
function hasKeys<K extends string>(value: unknown, keys: readonly K[]): value is Record<K, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

function isInteger(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function isCellValue(value: unknown): value is number {
  return isInteger(value, EMPTY, COLORS);
}

function isBall(value: unknown): value is Ball {
  return hasKeys(value, ['cell', 'color']) && isInteger(value.cell, 0, CELLS - 1) && isInteger(value.color, 1, COLORS);
}

/** Every score is a sum of `points(n)`, and those are all multiples of 10. */
function isScore(value: unknown): value is number {
  return isInteger(value, 0, Number.MAX_SAFE_INTEGER) && value % 10 === 0;
}
