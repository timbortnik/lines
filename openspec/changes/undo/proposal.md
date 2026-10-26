# Proposal

## Why

A mis-tap can't be taken back. On a phone it is easy to tap the wrong cell, and the ball walks there for good. An Undo button lets the player take back the last move.

## What Changes

- **An Undo button in the bar** takes back the last move: the board, next balls and score return to what they were before it. It is greyed out when there is nothing to undo.
- **One step only.** After an undo there is nothing more to undo until the next move.
- **A move played right after an undo can't be undone.** Each move draws new next balls at random, so undoing and replaying could redraw them again and again. With this rule each draw gets at most one retry.
- **Undo works after game over** and takes back the move that ended the game. The best score is unaffected, since a game only counts towards it when it is replaced.
- **New game clears it**, so Undo can't bring back an abandoned game without the confirmation.
- **Undo is instant:** the board is redrawn without animation, and any selection is dropped. Like New game, it is ignored while a turn is animated.
- **The game is saved after an undo**, so a reload resumes the game as it was before the undone move. What Undo could bring back isn't saved: after the page is opened there is nothing to undo.
- **The first move of a resumed game can't be undone.** The save doesn't record whether it was written by an undo, so a game resumed when the page opens is treated as if it just was. Otherwise move, undo, reload would get around the rule above.
- **The bar's New game button becomes "New",** and the bar's spacing shrinks, so the bar still fits on a 320px-wide screen. The game-over message keeps its "New game" button.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-board`: the bar shows Undo and a New button; new requirements for what Undo does and when it is available, including after the page opens; taps on Undo are ignored during a turn.
- `game-saving`: the game is also saved after an undo.

## Out of Scope

- **Undoing more than one move**, and redo.
- **Keeping Undo across a reload or restart.** That would change the save format, and saves of the current format would need to keep loading.
- **Animating the undo** in reverse.
- **Replaying the same draws** after an undo. It wouldn't stop fishing for draws, since a different move draws for different cells; the rule above limits it instead.

## Impact

- **New code:** `src/game/undo.ts`, which holds the rule of what Undo can bring back, with tests under the coverage gate.
- **Changed files:** `src/main.ts`, `src/ui/view.ts`, `site/index.html`, `site/style.css`.
- **Unchanged:** the rules of a move, the save format, and the dependencies.
