# Design

## Context

The rules in `src/game/` keep the whole game in a plain `Game` object that survives a JSON round trip (game-rules spec). `src/main.ts` holds the current `Game`, calls `move`, animates the turn and redraws from the new state. Nothing is stored yet. See proposal.md for the motivation and the specs for the behaviour.

## Goals / Non-Goals

**Goals:**
- Loading a save can never crash the game or put it in a state the rules don't expect.
- The checking code is pure and covered by the 100% gate; the storage code is a few lines.

**Non-Goals:**
- Migrating saves between formats; there is only one so far.
- Keeping two tabs in step.

## Decisions

### 1. One entry, one format

localStorage holds a single entry, `lines-save`, with JSON text:

```ts
interface Save {
  version: 1;    // SAVE_VERSION; a later format bumps it
  game: Game;    // the game in progress, or the last one if it ended
  best: number;  // the highest score of the games that ended before `game`
}
```

- **One entry**, so the game and the best score are always written together and can't disagree.
- **`best` excludes the current game.** The bar shows `max(best, game.score)`, and the current score is added to `best` when a new game replaces this one. That makes "New best!" exact (`game.score > best`), even after a reload, and an abandoned game's score still counts.
  - Alternative considered: keep `best` always at least the current score. Then a game that ends exactly on the earlier best looks like a new best, and the earlier value is lost on a reload.
- **The origin is dedicated to the game**, so the key needs no further namespace.

### 2. Checking a save: `parseSave` in `src/game/save.ts`

`parseSave(text: string): Save` parses the JSON and checks it, throwing an `Error` that names the first problem:

- objects have exactly the expected keys;
- `version` is `SAVE_VERSION`;
- the board is 81 integers from 0 to 7;
- the board holds at least one ball, since a cleared board is refilled at once;
- at most 3 next balls, each with an integer cell from 0 to 80 and a color from 1 to 7, on distinct cells that hold no ball;
- `score` and `best` are non-negative safe integers and multiples of 10, since every score is a sum of `points(n)`, all multiples of 10;
- `over` is true exactly when the board has no empty cell;
- no line of 5 is left on the board, because `move` only looks for lines through the cells that change.

Every check is a property every game the rules produce already has, so a real save never fails one. It lives in `src/game/` so the coverage gate covers it. It doesn't touch storage.

Alternative considered: accept anything with the right shape. A hand-edited or damaged save could then show balls on a full board, or a game that can never end.

### 3. Storage: `src/ui/storage.ts`

- `load(): Save | null`: null when there's no entry; also null, with a console warning naming the problem, when reading throws (blocked storage) or `parseSave` rejects the entry. The bad entry stays until the next save overwrites it.
- `store(game, best)`: writes the entry; when `setItem` throws (blocked, or quota exceeded), it warns once per page load and the game plays on.

### 4. When `main.ts` saves

- **At start:** load; if the saved game is over, it counts towards `best` and a new game starts. Then save, so a reload of a fresh game shows the same game.
- **After a move is decided:** `store(turn.game, best)` runs before `playTurn`. Closing the page mid-animation keeps the turn.
- **New game:** `best = max(best, game.score)`, a new game, save, redraw.

### 5. New game confirmation: `<dialog>`

- `index.html` gets a `<dialog id="confirm">` holding a `<form method="dialog">` with two buttons, `value="keep"` and `value="new"`.
- `showModal()` makes the rest of the page inert, so the board can't be tapped while it's open. Escape closes it without a value.
- `main.ts` clears `returnValue` before opening and starts a new game on `close` only when it is `"new"`.
- The bar's button asks only while the game isn't over; the game-over message's button never asks. Both share one handler.
- Alternative considered: `window.confirm()`. It's less code, but the browser draws it outside the game's look and on phones it names the site's address.

### 6. Showing the best score

- **The bar's score item becomes two lines:** the score, and below it "Best N" in smaller text, which still fits the 48px bar.
- **`render` takes `best`.** It shows `max(best, game.score)` in the bar, and "New best!" in the game-over message when `game.over && game.score > best`.
- **During a turn's animation**, only the score counts up. The best score updates in the redraw at the end of the turn.

### 7. Checking the UI

As in `playable-board`, a throwaway headless-Chrome script in the scratchpad:
- reloads mid-game and after game over;
- writes damaged entries;
- blocks storage by replacing `localStorage` with a getter that throws;
- drives the dialog;
- reads console warnings.

## Risks / Trade-offs

- **A damaged save loses the best score too** → damage needs hand-editing or a format bug; keeping the two together keeps them consistent. The console says why.
- **A later rule change could make old saves fail the checks** → the format version is there for that change to bump and handle.
- **Mixed old and new files for 10 minutes after this deploy**, as seen after `playable-board`, could stop the page loading until a reload → fixed by `installable-offline`; nothing is written when the page fails to load, so no save is lost.
