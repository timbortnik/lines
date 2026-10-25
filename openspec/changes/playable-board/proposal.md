# Proposal

## Why

The rules are done and fully tested, but https://lines.bortnik.org still shows a placeholder. This change makes the game playable in the browser on phones and desktops, and is the first change players can see.

## What Changes

- **The game screen** replaces the placeholder:
  - a bar with the score, the next 3 balls as a small preview, and a New game button;
  - a square 9×9 board below it, as large as the screen allows, with no scrolling in portrait or landscape;
  - balls drawn by CSS as shiny spheres in 7 colors, and the next balls shown small on their cells, as in Lines98.
- **Input by tap or click**, the same for mouse, touchpad and touch:
  - tap a ball to select it; it bounces;
  - tap another ball to switch, or the same ball to drop the selection;
  - tap an empty cell, or a cell with a small ball, to move there;
  - when no free path leads there, nothing happens and the ball stays selected.
- **Animated turns.** The rules' turn record is played in order: the ball walks along its path, a covered next ball jumps, lines shrink away while the score counts up, new balls grow, and new small balls appear. The board is then redrawn from the new game state. Taps are ignored while a turn plays.
- **Reduced motion.** When the system asks for reduced motion, turns play at once and the selected ball is highlighted without bouncing.
- **Game over** shows the final score and a New game button. New game starts over at once, without asking.
- **The relative-URL guard covers stylesheets**, since the site gets its first one.
- **The README** explains running the game locally while editing.

## Capabilities

### New Capabilities

- `game-board`: what the player sees and does: the screen, selecting and moving balls, turn animations, reduced motion, game over and new game, and the layout on phones and desktops.

### Modified Capabilities

- `site-delivery`: the "Relative URLs only" requirement also covers stylesheets.

## Out of Scope

- **Saving the game and the best score:** `save-and-resume`. A reload starts a new game until then, which is why New game doesn't ask for confirmation yet.
- **Working offline and installing:** `installable-offline`.
- **Sound, undo, settings, hints** such as highlighting reachable cells, **keyboard play and screen-reader support**.
- **A dev-server script.** The README documents `npx tsc -p . --watch` with any static file server instead.
- **Unit tests for the UI code.** They would need a DOM library such as jsdom, which the dependency rule excludes. The UI is checked by hand in a desktop browser and on a phone.

## Impact

- **New code:** `src/ui/` (drawing and animation) and `site/style.css`; `src/main.ts` changes from the placeholder to the game's entry point.
- **Changed files:** `site/index.html`, `test/site.test.ts` (a URL check for CSS), the README.
- **Rules module:** unchanged.
- **Dependencies:** none added.
