// Board geometry: a 9×9 grid stored row by row as 81 cells, numbered 0–80.

export const SIZE = 9;
export const CELLS = SIZE * SIZE;
export const COLORS = 7;
export const EMPTY = 0;

export const row = (cell: number): number => Math.floor(cell / SIZE);
export const column = (cell: number): number => cell % SIZE;
export const cellAt = (r: number, c: number): number => r * SIZE + c;
export const inside = (r: number, c: number): boolean => r >= 0 && r < SIZE && c >= 0 && c < SIZE;

/** The cells above, below, left of and right of `cell`, in that order, skipping the board's edges. */
export function neighbours(cell: number): number[] {
  const r = row(cell);
  const c = column(cell);
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ]
    .filter(([nr, nc]) => inside(nr, nc))
    .map(([nr, nc]) => cellAt(nr, nc));
}
