// Routes through empty cells, stepping only up, down, left or right.

import { EMPTY, neighbours } from './board.ts';

/**
 * A shortest route from `from` to `to` through empty cells, including both ends, or null when
 * there is none. Next balls aren't on the board, so routes may cross their cells.
 */
export function findPath(board: readonly number[], from: number, to: number): number[] | null {
  const previous = new Array<number>(board.length).fill(-1);
  previous[from] = from;
  const queue = [from];
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head];
    if (cell === to) return route(previous, from, to);
    for (const next of neighbours(cell)) {
      if (previous[next] === -1 && board[next] === EMPTY) {
        previous[next] = cell;
        queue.push(next);
      }
    }
  }
  return null;
}

function route(previous: readonly number[], from: number, to: number): number[] {
  const path = [to];
  while (path[0] !== from) path.unshift(previous[path[0]]);
  return path;
}
