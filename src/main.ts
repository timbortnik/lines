// The page's entry point: starts a game and draws it.

import { newGame } from './game/game.ts';
import { createView, render } from './ui/view.ts';

const view = createView();
const game = newGame(Math.random);

render(view, game);
