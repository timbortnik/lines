# Proposal

## Why

With 7 colors, games end too soon to be fun unless the player plans every move. Bots playing the real rules show this. A greedy bot, which takes the best move one ball at a time, lasts a median of 248 moves at 7 colors, about 20 minutes, but 2,040 moves at 6 colors. A bot that looks two moves ahead lasts a median of 2,857 moves at 7 colors. The reason is a threshold. A move without a line adds 3 balls and a line removes at least 5, so the board stays open only while 3 of every 8 moves complete a line. Each color fewer makes that much easier to reach.

## What Changes

- **The game uses 6 colors:** red, green, blue, yellow, purple and cyan. Brown goes. It is the dullest of the seven, and the one color-blind players most easily mix up with red and green.
- **Colors 1–6 keep their numbers,** so the rules and the drawing only lose the 7th.
- **BREAKING for saves:** a save holding a brown ball, so nearly every save, now fails the save check. The existing behaviour then applies: a new game starts and the best score starts at 0. This was accepted on purpose, since a best score from the 7-color game isn't comparable anyway.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-rules`: "Board and colors" says 6 colors instead of 7.

## Out of Scope

- **Migrating saves:** no code keeps old games or best scores. Considered and rejected:
  - keeping the best score when only the game is unusable, which changes the save check for every damaged save;
  - accepting brown in old saves, a special case kept forever for a one-time event.
- **A color ramp** (5, then 6, then 7 colors as the score grows) and **a difficulty setting:** considered, not chosen.
- **Scoring, board size, line length and the number of next balls:** unchanged.

## Impact

- **Changed code:** `src/game/board.ts` (`COLORS`), a comment in `src/game/game.ts`, and the brown ball style in `site/style.css`.
- **Changed tests:** boards and helpers in `test/game/` that use color 7, the two save tests for an out-of-range color, and a new test that colors run from 1 to 6.
- **Unchanged:** the save format and version, the UI code, and the dependencies.
