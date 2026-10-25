// Lines of same-colored balls in the 4 directions: across, down and both diagonals.

import { cellAt, column, inside, row } from './board.ts';

export const MIN_LINE = 5;

// [row step, column step]
const DIRECTIONS = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

/**
 * Every cell in a line of MIN_LINE or more same-colored balls through any of `cells`, each once.
 * The given cells must hold balls.
 */
export function findLines(board: readonly number[], cells: readonly number[]): number[] {
  const found = new Set<number>();
  for (const cell of cells) {
    for (const [dr, dc] of DIRECTIONS) {
      const line = [cell, ...run(board, cell, dr, dc), ...run(board, cell, -dr, -dc)];
      if (line.length >= MIN_LINE) for (const member of line) found.add(member);
    }
  }
  return [...found];
}

/** The cells beyond `cell` in the direction (dr, dc) that hold the same color, up to the first that doesn't. */
function run(board: readonly number[], cell: number, dr: number, dc: number): number[] {
  const cells: number[] = [];
  let r = row(cell) + dr;
  let c = column(cell) + dc;
  while (inside(r, c) && board[cellAt(r, c)] === board[cell]) {
    cells.push(cellAt(r, c));
    r += dr;
    c += dc;
  }
  return cells;
}
