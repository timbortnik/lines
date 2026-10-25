# Proposal

## Why

The game is playable at https://lines.bortnik.org, but reloading the page or reopening the browser loses the game. The project's goal is a game that is kept on the device and survives restarts, and a best score gives players something to beat.

## What Changes

- **The game is saved on the device** right after each move is decided, before its animation plays, and whenever a new game starts. Opening the page resumes it. The selected ball isn't saved.
- **A finished game isn't resumed.** Opening the page after game over starts a new game.
- **Saved data is checked before use.** A new function in the rules module checks the format version, the board, the next balls, the scores and the game-over flag, and that no line of 5 is left on the board. A save that fails is ignored with a console warning, and a new game starts.
- **A best score**, kept on the device: the highest score of any game, the current one included. It is shown in the bar, under the score. The game-over message says "New best!" when a game beats it.
- **New game asks first** during an unfinished game, in an in-page dialog with Keep playing and New game. After game over it starts at once.
- **Blocked or full storage** doesn't stop the game: it plays on unsaved, with one console warning.

## Capabilities

### New Capabilities

- `game-saving`: keeping the game and the best score on the device: saving, resuming, checking saved data, the best score, and playing on when storage is unavailable.

### Modified Capabilities

- `game-board`: opening the page resumes a saved game, the bar shows the best score, and New game asks for confirmation during an unfinished game.

## Out of Scope

- **Several saved games, statistics, undo, and sync between devices.**
- **Two open tabs:** each saves its own moves, and the last one saved wins.
- **Working offline and installing:** `installable-offline`. That change also stops a returning visitor from getting a mix of old and new files for up to 10 minutes after a deploy.
- **Reading saves of other formats.** This is the first format; a later change that alters it decides how to handle older saves.

## Impact

- **New code:** `src/game/save.ts` with tests under the coverage gate, and `src/ui/storage.ts` for localStorage.
- **Changed files:** `src/main.ts`, `src/ui/view.ts`, `site/index.html`, `site/style.css`, the README.
- **Stored on the device:** one localStorage entry holding the game and the best score. Nothing leaves the device.
- **Dependencies:** none added.
