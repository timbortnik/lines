// Keeps the save in the browser's localStorage. Storage can be blocked or full; the game then plays on unsaved.

import type { Game } from '../game/game.ts';
import { SAVE_VERSION, parseSave } from '../game/save.ts';
import type { Save } from '../game/save.ts';

const KEY = 'lines-save';
let warnedUnsaved = false;

/** The checked save, or null when there is none or it can't be used. A bad save stays until the next store. */
export function load(): Save | null {
  let text: string | null;
  try {
    text = localStorage.getItem(KEY);
  } catch (error) {
    warnUnsaved(error);
    return null;
  }
  if (text === null) return null;
  try {
    return parseSave(text);
  } catch (error) {
    console.warn('Starting a new game: the saved game could not be used.', error);
    return null;
  }
}

export function store(game: Game, best: number): void {
  const save: Save = { version: SAVE_VERSION, game, best };
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (error) {
    warnUnsaved(error);
  }
}

/** Warns once per page load: when storage fails, every later turn fails the same way. */
function warnUnsaved(error: unknown): void {
  if (!warnedUnsaved) console.warn('The game is not being saved on this device.', error);
  warnedUnsaved = true;
}
