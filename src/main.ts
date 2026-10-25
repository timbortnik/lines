// The page's entry point: holds the game, takes the player's taps and animates each turn.

import { EMPTY } from './game/board.ts';
import { move, newGame } from './game/game.ts';
import { playTurn } from './ui/animate.ts';
import { createView, render } from './ui/view.ts';

const view = createView();
let game = newGame(Math.random);
/** The cell of the ball the player picked, if any. */
let selected: number | null = null;
/** True while a turn is animated; taps are ignored meanwhile. */
let busy = false;

view.cells.forEach((cell, index) => cell.addEventListener('click', () => void tap(index)));
for (const button of view.newGameButtons) button.addEventListener('click', restart);
render(view, game);

async function tap(cell: number): Promise<void> {
  if (busy || game.over) return;
  if (game.board[cell] !== EMPTY) {
    select(cell === selected ? null : cell);
    return;
  }
  if (selected === null) return;
  const turn = move(game, selected, cell, Math.random);
  // No free path: the ball stays selected.
  if (turn === null) return;
  select(null);
  busy = true;
  try {
    await playTurn(view, turn, game.score);
  } finally {
    // Even if an animation fails, the screen ends up showing the actual game.
    game = turn.game;
    render(view, game);
    busy = false;
  }
}

/** Starts over at once; there is nothing saved to lose yet. */
function restart(): void {
  if (busy) return;
  select(null);
  game = newGame(Math.random);
  render(view, game);
}

function select(cell: number | null): void {
  if (selected !== null) view.cells[selected].classList.remove('selected');
  selected = cell;
  if (cell !== null) view.cells[cell].classList.add('selected');
}
