// What the Undo button can bring back. It takes back the last move, but not a move played right after an undo:
// every move draws new next balls, so undoing and replaying could otherwise draw them again and again.

import type { Game } from './game.ts';

export interface History {
  /** The game before the last move, or null when there is nothing to undo. */
  previous: Game | null;
  /** True from an undo until the next move, whose draw then can't be retried. */
  undone: boolean;
}

/** A new game has nothing to undo. */
export const NEW_GAME_HISTORY: History = { previous: null, undone: false };

/**
 * A game resumed from the save has nothing to undo either. The save doesn't record whether it was written
 * by an undo, so the game is treated as if it was: otherwise undo, reload, move would get around the rule.
 */
export const RESUMED_HISTORY: History = { previous: null, undone: true };

/** The history after a move played from `game`. */
export function afterMove(history: History, game: Game): History {
  return { previous: history.undone ? null : game, undone: false };
}

/** Takes back the last move: the game before it, and the history after the undo. Null when there is nothing to undo. */
export function undo(history: History): { game: Game; history: History } | null {
  if (history.previous === null) return null;
  return { game: history.previous, history: { previous: null, undone: true } };
}
