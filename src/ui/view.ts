// Draws a game into the page whose skeleton is site/index.html. site/style.css does the styling.

import { CELLS, EMPTY } from '../game/board.ts';
import type { Ball, Game } from '../game/game.ts';

/** The page elements the game draws into and listens on. */
export interface View {
  /** The 81 cells, row by row, matching the board's cell numbers. */
  cells: HTMLElement[];
  score: HTMLElement;
  preview: HTMLElement;
  over: HTMLElement;
  finalScore: HTMLElement;
  newGameButtons: HTMLElement[];
}

/** Finds the page's elements and fills the board with empty cells. */
export function createView(): View {
  const cells = Array.from({ length: CELLS }, () => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    return cell;
  });
  byId('board').replaceChildren(...cells);
  return {
    cells,
    score: byId('score'),
    preview: byId('preview'),
    over: byId('over'),
    finalScore: byId('final-score'),
    newGameButtons: [byId('new-game'), byId('play-again')],
  };
}

/** Redraws everything from `game`: balls, next balls, score, preview and the game-over message. */
export function render(view: View, game: Game): void {
  view.cells.forEach((cell, index) => {
    const color = game.board[index];
    cell.replaceChildren(...(color === EMPTY ? [] : [ballElement(color)]));
  });
  for (const ball of game.next) view.cells[ball.cell].replaceChildren(ballElement(ball.color, true));
  showScore(view, game.score);
  showPreview(view, game.next);
  view.finalScore.textContent = String(game.score);
  view.over.hidden = !game.over;
}

/** A ball of `color`, full size or small for a next ball. */
export function ballElement(color: number, next = false): HTMLElement {
  const ball = document.createElement('div');
  ball.className = next ? `ball next c${color}` : `ball c${color}`;
  return ball;
}

export function showScore(view: View, score: number): void {
  view.score.textContent = String(score);
}

export function showPreview(view: View, next: Ball[]): void {
  view.preview.replaceChildren(...next.map((ball) => ballElement(ball.color)));
}

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`The page has no element with id "${id}"`);
  return element;
}
