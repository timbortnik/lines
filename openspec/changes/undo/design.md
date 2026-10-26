# Design

## Context

`src/main.ts` holds the game, the best score, the selection and a `busy` flag. A tap asks `move` in the rules module for a turn, saves the new game before animating it, and redraws everything with `render` afterwards. `move` never changes the game it is given, so the game before a move is still a complete, valid value after it.

The README says the UI "only draws, animates and passes taps to the rules", and the project context puts game rules in a pure, fully tested module.

The bar is already full on narrow phones. Measured in headless Chrome with three preview balls, the bar uses 328 of the 328px available on a 360px-wide screen. An "Undo" button between the preview and New game makes it 378px. A "↶" button instead makes it 353px.

## Goals / Non-Goals

**Goals:**
- The rule for what Undo can bring back is unit-tested under the coverage gate.
- No change to `move`, the save format or the turn animation.

**Non-Goals:**
- A general history of games. Only the one game before the last move is kept.

## Decisions

### 1. The rule lives in `src/game/undo.ts`

A small pure module holds a history value and two functions:

- `History` is `{ previous: Game | null, undone: boolean }`. `previous` is the game before the last move, or null when there is nothing to undo. `undone` is true from an undo until the next move.
- `NEW_GAME_HISTORY` is the history of a new game: nothing to undo. `RESUMED_HISTORY` is the history of a game resumed from the save: nothing to undo, and `undone` is true. The save doesn't record whether it was written by an undo, so a resumed game is treated as if it was, and its first move can't be undone.
- `afterMove(history, game)` gives the history after a move from `game`: `previous` is `game`, unless the move came right after an undo, when it is null.
- `undo(history)` gives the game to go back to and the history after it, or null when there is nothing to undo.

`main.ts` keeps a `history` beside `game` and changes both together. It starts with `RESUMED_HISTORY` when the page resumes a saved game, and with `NEW_GAME_HISTORY` otherwise.

*Alternative:* two variables in `main.ts`. That is about as short, but the rule would then live in the UI, untested, and the README's account of the UI would be wrong. The rule against redrawing next balls is the part of this change most likely to break unnoticed, so it gets tests.

### 2. History is updated with the game, after the animation

When a turn is played, `main.ts` saves the new game before animating it, as now. When the animation ends, it sets `history = afterMove(history, game)` and then `game = turn.game`. Undo is ignored while `busy`, so it never sees a game that has been saved but not yet shown.

### 3. Undo redraws and saves at once

Pressing Undo drops the selection, sets the game and history from `undo`, saves the game and calls `render`. No animation. Saving matters: otherwise a reload would bring back the move that was undone. A new game sets `history` to `NEW_GAME_HISTORY`.

### 4. `render` sets the Undo button

`render(view, game, best, canUndo)` also sets the button's `disabled`. `main.ts` passes `history.previous !== null`. During a turn's animation the button still shows its state from before the move; the existing `busy` check ignores it then.

*Alternative:* `main.ts` sets `disabled` itself after each `render`. That would put a second drawing step at each of the four places the page is redrawn.

### 5. The bar: "New" and an 8px gap

The bar's button reads "New". The game-over message keeps "New game", and so does the dialog. The bar's gap shrinks from 16px to 8px, and the bar's buttons get 0.5em of side padding instead of 0.9em. Measured with 5-digit scores, the bar's items then take 286 of the 288px available at a 320px width, and 317 of 328px at 360px. A side padding of 0.6em still overflows at 320px. A disabled button is drawn at reduced opacity, with the default cursor.

*Alternatives:* icon buttons need a glyph every platform draws, or inline SVG, and are less clear than words. A second row of buttons would take height from the board on landscape screens.

## Risks / Trade-offs

- [Long scores could overflow the bar on the narrowest screens] → Measured at 320px with 5-digit scores and best scores (decision 5). The margin there is 2px, and fonts differ between systems, so a 320px-wide phone with a wider font than the test machine could still overflow. 360px leaves 11px.
- [A reload loses Undo] → Accepted and specified. Keeping it would need a new save format, plus code to keep loading saves of the current one.
- [Move, undo, reload, move would get around the rule, since the save doesn't record the undo] → A resumed game's first move can't be undone (decision 1), so a reload buys no retry. The cost: an honest mis-tap on the first move after the page opens can't be taken back. Recording the undo in the save would avoid that, but needs a new save format.
