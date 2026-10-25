// Plays a turn's events on the drawn board, one after another, with the Web Animations API.
// The caller redraws the board from the new game state afterwards, so this only has to look right.

import { column, row } from '../game/board.ts';
import type { Ball, Turn } from '../game/game.ts';
import { ballElement, showPreview, showScore } from './view.ts';
import type { View } from './view.ts';

/** Milliseconds a walking ball takes per cell. */
const STEP = 35;
const VANISH = 300;
const GROW = 200;
/** A next ball's size relative to a full ball, as `.ball.next` in style.css draws it. */
const NEXT_SCALE = 0.4;

/** Animates `turn`, counting the score up from `score`, the score before the turn. */
export async function playTurn(view: View, turn: Turn, score: number): Promise<void> {
  for (const event of turn.events) {
    switch (event.type) {
      case 'moved':
        await walk(view, event.path);
        break;
      case 'jumped':
        await grow(view, [{ cell: event.to, color: event.color }], true, 0);
        break;
      case 'removed':
        score += event.points;
        showScore(view, score);
        await vanish(view, event.cells);
        break;
      case 'appeared':
        await grow(view, event.balls, false, NEXT_SCALE);
        break;
      case 'refilled':
        await grow(view, event.balls, false, 0);
        break;
      case 'chosen':
        showPreview(view, event.balls);
        await grow(view, event.balls, true, 0);
        break;
      case 'over':
        // The redraw after the turn shows the game-over message.
        break;
    }
  }
}

/** Moves the ball at the path's start through every cell of it, then into the last cell. */
async function walk(view: View, path: number[]): Promise<void> {
  const from = path[0];
  const ball = ballAt(view, from);
  // A ball's box is exactly one cell, so 100% is one cell at any board size.
  const keyframes = path.map((cell) => ({
    transform: `translate(${(column(cell) - column(from)) * 100}%, ${(row(cell) - row(from)) * 100}%)`,
  }));
  ball.classList.add('moving');
  await ball.animate(keyframes, timing(STEP * (path.length - 1), 'linear')).finished;
  ball.classList.remove('moving');
  // This runs before the next paint, so the ball doesn't flash back to where it started.
  view.cells[path[path.length - 1]].replaceChildren(ball);
}

/** Puts `balls` on their cells and grows them from `scale` of their size. */
async function grow(view: View, balls: Ball[], next: boolean, scale: number): Promise<void> {
  await Promise.all(
    balls.map((ball) => {
      const element = ballElement(ball.color, next);
      view.cells[ball.cell].replaceChildren(element);
      return element.animate([{ transform: `scale(${scale})` }, { transform: 'none' }], timing(GROW)).finished;
    }),
  );
}

/** Shrinks and fades the balls on `cells`, then takes them off. */
async function vanish(view: View, cells: number[]): Promise<void> {
  const keyframes = [{ transform: 'none', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }];
  await Promise.all(cells.map((cell) => ballAt(view, cell).animate(keyframes, timing(VANISH)).finished));
  for (const cell of cells) view.cells[cell].replaceChildren();
}

function ballAt(view: View, cell: number): Element {
  const ball = view.cells[cell].firstElementChild;
  if (ball === null) throw new Error(`No ball is drawn on cell ${cell}`);
  return ball;
}

/** Animation timing; no motion when the system asks for reduced motion. */
function timing(duration: number, easing = 'ease-out'): KeyframeAnimationOptions {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { duration: reduced ? 0 : duration, easing };
}
