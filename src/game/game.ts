// The rules of Color Lines as pure functions over plain data. Randomness always comes from the caller.

import { CELLS, COLORS, EMPTY } from './board.ts';
import { findLines } from './lines.ts';
import { findPath } from './path.ts';

/** Returns a float in [0, 1), like Math.random. */
export type Random = () => number;

export interface Ball {
  cell: number;
  color: number;
}

export interface Game {
  /** 81 cells, row by row: EMPTY or a color 1–7. */
  board: number[];
  /** The balls due to appear next, each on a cell that holds no ball. */
  next: Ball[];
  score: number;
  over: boolean;
}

export type TurnEvent =
  | { type: 'moved'; path: number[] }
  | { type: 'jumped'; from: number; to: number; color: number }
  | { type: 'removed'; cells: number[]; points: number }
  | { type: 'appeared'; balls: Ball[] }
  | { type: 'refilled'; balls: Ball[] }
  | { type: 'chosen'; balls: Ball[] }
  | { type: 'over' };

/** The new game and what happened on the way to it, in order. */
export interface Turn {
  game: Game;
  events: TurnEvent[];
}

export const START_BALLS = 5;
export const NEXT_BALLS = 3;

export function newGame(random: Random): Game {
  const board = new Array<number>(CELLS).fill(EMPTY);
  placeFresh(board, [], random);
  return { board, next: chooseNext(board, random), score: 0, over: false };
}

/** Points for removing `count` balls at once: 10 for five, doubling with each further ball. */
export function points(count: number): number {
  return 10 * 2 ** (count - 5);
}

/**
 * Moves the ball at `from` to the empty cell `to` and plays out the rest of the turn.
 * Returns null when the move isn't allowed. Never changes `game`.
 */
export function move(game: Game, from: number, to: number, random: Random): Turn | null {
  // `> EMPTY` also rejects an origin off the board, where the lookup gives undefined.
  if (game.over || !(game.board[from] > EMPTY) || game.board[to] !== EMPTY) return null;
  const path = findPath(game.board, from, to);
  if (path === null) return null;

  const board = [...game.board];
  const events: TurnEvent[] = [{ type: 'moved', path }];
  board[to] = board[from];
  board[from] = EMPTY;
  const next = jumpCovered(board, game.next, to, random, events);

  const lined = findLines(board, [to]);
  if (lined.length > 0) {
    const score = game.score + remove(board, lined, events);
    refillIfCleared(board, next, random, events);
    return { game: { board, next, score, over: false }, events };
  }

  for (const ball of next) board[ball.cell] = ball.color;
  events.push({ type: 'appeared', balls: next });
  let score = game.score;
  const completed = findLines(board, next.map((ball) => ball.cell));
  if (completed.length > 0) {
    score += remove(board, completed, events);
    refillIfCleared(board, [], random, events);
  }
  const chosen = chooseNext(board, random);
  events.push({ type: 'chosen', balls: chosen });
  const over = !board.includes(EMPTY);
  if (over) events.push({ type: 'over' });
  return { game: { board, next: chosen, score, over }, events };
}

/** A next ball the moving ball landed on jumps to a free cell. One exists: the ball just left its cell. */
function jumpCovered(board: number[], next: Ball[], landing: number, random: Random, events: TurnEvent[]): Ball[] {
  const covered = next.find((ball) => ball.cell === landing);
  if (covered === undefined) return next;
  const [cell] = freeCells(board, next.filter((ball) => ball !== covered), 1, random);
  events.push({ type: 'jumped', from: landing, to: cell, color: covered.color });
  return next.map((ball) => (ball === covered ? { cell, color: ball.color } : ball));
}

function remove(board: number[], cells: number[], events: TurnEvent[]): number {
  for (const cell of cells) board[cell] = EMPTY;
  const gained = points(cells.length);
  events.push({ type: 'removed', cells, points: gained });
  return gained;
}

/** After a removal that leaves no ball on the board, a fresh set goes on cells without next balls. */
function refillIfCleared(board: number[], next: Ball[], random: Random, events: TurnEvent[]): void {
  if (board.some((color) => color !== EMPTY)) return;
  events.push({ type: 'refilled', balls: placeFresh(board, next, random) });
}

/** Places START_BALLS random balls on free cells, drawing again whenever they would form a line. */
function placeFresh(board: number[], next: Ball[], random: Random): Ball[] {
  for (;;) {
    const balls = freeCells(board, next, START_BALLS, random).map((cell) => ({ cell, color: randomColor(random) }));
    for (const ball of balls) board[ball.cell] = ball.color;
    if (findLines(board, balls.map((ball) => ball.cell)).length === 0) return balls;
    for (const ball of balls) board[ball.cell] = EMPTY;
  }
}

function chooseNext(board: number[], random: Random): Ball[] {
  return freeCells(board, [], NEXT_BALLS, random).map((cell) => ({ cell, color: randomColor(random) }));
}

/** Up to `count` distinct random cells that hold neither a ball nor one of `next`. */
function freeCells(board: readonly number[], next: readonly Ball[], count: number, random: Random): number[] {
  const taken = new Set(next.map((ball) => ball.cell));
  const free: number[] = [];
  for (let cell = 0; cell < board.length; cell++) {
    if (board[cell] === EMPTY && !taken.has(cell)) free.push(cell);
  }
  // A partial Fisher–Yates shuffle: the first `n` entries become a uniform random sample.
  const n = Math.min(count, free.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(random() * (free.length - i));
    [free[i], free[j]] = [free[j], free[i]];
  }
  return free.slice(0, n);
}

function randomColor(random: Random): number {
  return 1 + Math.floor(random() * COLORS);
}
