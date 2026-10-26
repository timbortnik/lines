// Draws a game into the page whose skeleton is site/index.html. site/style.css does the styling.

import { CELLS, EMPTY } from '../game/board.ts';
import type { Ball, Game } from '../game/game.ts';

/** The page elements the game draws into and listens on. */
export interface View {
  /** The 81 cells, row by row, matching the board's cell numbers. */
  cells: HTMLElement[];
  score: HTMLElement;
  best: HTMLElement;
  preview: HTMLElement;
  over: HTMLElement;
  finalScore: HTMLElement;
  newBest: HTMLElement;
  /** Takes back the last move. Disabled when there is nothing to undo. */
  undo: HTMLButtonElement;
  newGameButtons: HTMLElement[];
  /** Asks before an unfinished game is replaced. */
  confirm: HTMLDialogElement;
}

/** Finds the page's elements and fills the board with empty cells. */
export function createView(): View {
  const cells = Array.from({ length: CELLS }, () => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    return cell;
  });
  byId('board', HTMLElement).replaceChildren(...cells);
  return {
    cells,
    score: byId('score', HTMLElement),
    best: byId('best', HTMLElement),
    preview: byId('preview', HTMLElement),
    over: byId('over', HTMLElement),
    finalScore: byId('final-score', HTMLElement),
    newBest: byId('new-best', HTMLElement),
    undo: byId('undo', HTMLButtonElement),
    newGameButtons: [byId('new-game', HTMLElement), byId('play-again', HTMLElement)],
    confirm: byId('confirm', HTMLDialogElement),
  };
}

/**
 * Redraws everything from `game`: balls, next balls, scores, preview, the Undo button and the game-over message.
 * `best` is the best score of the games before this one. `canUndo` enables the Undo button.
 */
export function render(view: View, game: Game, best: number, canUndo: boolean): void {
  view.cells.forEach((cell, index) => {
    const color = game.board[index];
    cell.replaceChildren(...(color === EMPTY ? [] : [ballElement(color)]));
  });
  for (const ball of game.next) view.cells[ball.cell].replaceChildren(ballElement(ball.color, true));
  showScore(view, game.score);
  view.best.textContent = String(Math.max(best, game.score));
  showPreview(view, game.next);
  view.finalScore.textContent = String(game.score);
  view.newBest.hidden = !(game.over && game.score > best);
  view.over.hidden = !game.over;
  view.undo.disabled = !canUndo;
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

function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`The page has no ${type.name} with id "${id}"`);
  return element;
}
