# Proposal

## Why

The project has its toolchain, deploys and quality controls, but no game yet. The rules of Color Lines are the core that every later change builds on: `playable-board` draws and animates them, and `save-and-resume` stores their state. Building them first, as a pure module with no UI and complete test coverage, makes them trustworthy before anything visual depends on them.

## What Changes

- **A rules module in `src/game/`**, with no DOM access. It implements the game as the maintainer decided it:
  - a 9×9 board with balls in 7 colors;
  - a new game starts with 5 balls on random cells, none of them forming a line;
  - the 3 next balls are chosen ahead of time, with both a color and a cell, so the board can show them small and a preview can list them;
  - a move takes a ball to an empty cell along a path of orthogonally adjacent empty cells, where cells holding a small next ball count as empty;
  - landing on a small next ball makes it jump to another free cell;
  - lines of 5 or more same-colored balls through the moved ball, in any of the 4 directions, are removed and scored, and the player gets a free move;
  - otherwise the next balls appear, any lines they form are removed and scored, and 3 new next balls are chosen;
  - scoring doubles with length: 10 × 2^(n−5) points for n balls removed at once;
  - the game is over when the board is full after balls appear.
- **Injected randomness.** Every random choice comes from a function the caller passes in, so tests are deterministic.
- **A turn record.** It lists what happened, in order (the path, any jump, removals, appearances, the new next balls, game over), so `playable-board` can animate exactly that.
- **Game state as plain data**, which survives a JSON round trip, so `save-and-resume` can store it.
- **A 100% coverage gate** in `npm test` for the rules module. It counts modules no test imports, so an untested module can't slip through.
- **Minimum Node.js 22.8**, up from 22. The coverage thresholds need Node 22.8 or newer.

## Capabilities

### New Capabilities

- `game-rules`: the rules of the game. It covers the board, the starting position, next balls, moves, removing lines, scoring, game over, the turn record and the shape of the game state.

### Modified Capabilities

- `build-and-test`: the test command enforces full coverage of the rules module, and the supported Node.js versions start at 22.8.

## Out of Scope

- **Anything visible:** drawing the board, input and animation are `playable-board`.
- **Saving the game and the best score:** `save-and-resume`, including validating saved data.
- **Undo, timers, sound** and the joker (multicolor) ball some variants have.
- **Hints**, such as highlighting the cells a selected ball can reach.

## Impact

- **New code:** `src/game/` and its tests under `test/`, with a guard test that loads every rules module.
- **Changed files:**
  - `package.json`: the coverage flags in the `test` script, and `engines.node` raised to `>=22.8`;
  - `test/tsconfig.json`: it compiles all of `src/game/`;
  - `openspec/config.yaml`: the Node version in the project context;
  - the README's "Requirements" and "Testing" sections.
- **Dependencies:** none added.
- **What players see:** nothing yet. The placeholder page stays until `playable-board`.
