// The page's entry point: holds the game, takes the player's taps, animates each turn and saves the game.

import { EMPTY } from './game/board.ts';
import { move, newGame } from './game/game.ts';
import { playTurn } from './ui/animate.ts';
import { load, store } from './ui/storage.ts';
import { createView, render } from './ui/view.ts';

const view = createView();
const saved = load();
let game = saved?.game ?? newGame(Math.random);
/** The highest score of the games that ended before this one. */
let best = saved?.best ?? 0;
/** The cell of the ball the player picked, if any. */
let selected: number | null = null;
/** True while a turn is animated; taps are ignored meanwhile. */
let busy = false;

view.cells.forEach((cell, index) => cell.addEventListener('click', () => void tap(index)));
for (const button of view.newGameButtons) button.addEventListener('click', requestNewGame);

if (game.over) {
  // A finished game isn't resumed.
  startNewGame();
} else {
  store(game, best);
  render(view, game, best);
}

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
  // Saved before the animation, so closing the page mid-turn keeps the turn.
  store(turn.game, best);
  select(null);
  busy = true;
  try {
    await playTurn(view, turn, game.score);
  } finally {
    // Even if an animation fails, the screen ends up showing the actual game.
    game = turn.game;
    render(view, game, best);
    busy = false;
  }
}

function requestNewGame(): void {
  if (busy) return;
  startNewGame();
}

/** Ends the current game, counting its score towards the best, and starts a new one. */
function startNewGame(): void {
  best = Math.max(best, game.score);
  select(null);
  game = newGame(Math.random);
  store(game, best);
  render(view, game, best);
}

function select(cell: number | null): void {
  if (selected !== null) view.cells[selected].classList.remove('selected');
  selected = cell;
  if (cell !== null) view.cells[cell].classList.add('selected');
}
