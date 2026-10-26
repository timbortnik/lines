# Proposal

## Why

When a ball lands on a next ball, that next ball jumps to a random free cell, which the player can't foresee. It can land anywhere, even in the middle of a line the player is building. Sending it to the cell the ball just left makes the move predictable: the two simply swap places.

## What Changes

- **Landing on a next ball swaps them:** the next ball moves to the cell the moving ball left and keeps its color. No random choice is made on landing.
- **Unchanged:** 3 balls still arrive per turn, game over still comes when the board fills, the turn record still reports the jump, and the board still animates it as before, now at the vacated cell.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `game-rules`: "Landing on a next ball" sends the covered next ball to the cell the moving ball left, not to a random free cell.

## Out of Scope

- **Removing the covered next ball instead.** It was considered and rejected: the cell a ball leaves is always empty after the turn, so the board could never fill and the game could never end.
- **Saved games:** the save format and its checks are unchanged. A game saved before this change resumes normally.

## Impact

- **Changed code:** `src/game/game.ts` and its tests in `test/game/move.test.ts`.
- **Unchanged:** the UI, the save format, and the dependencies.
