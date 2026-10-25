# Design

## Context

`src/game/` holds the rules: `newGame` and `move` return plain data, and `move` returns a `Turn` whose `events` list what happened, in order (`moved`, `jumped`, `removed`, `appeared`, `refilled`, `chosen`, `over`). `src/main.ts` is a placeholder. The browser build compiles all of `src/` with the DOM library; the test build compiles only `test/` and `src/game/`, without it. See proposal.md for the motivation and specs/game-board/spec.md for the behaviour.

## Goals / Non-Goals

**Goals:**
- Small UI code that only draws, animates and handles input; every rule decision stays in `src/game/`.
- A screen that can never drift from the game state.

**Non-Goals:**
- Changes to the rules module.
- Pixel-perfect Lines98 graphics; the look is drawn with plain CSS.

## Decisions

### 1. Files

```
site/index.html    the page skeleton: bar, board container, game-over message
site/style.css     every visual: layout, cells, balls, colours, the selection bounce
src/main.ts        entry point: game state, selection, taps, New game
src/ui/view.ts     finds the page's elements, creates the 81 cells, draws a Game
src/ui/animate.ts  plays a Turn's events with the Web Animations API
```

The static skeleton lives in HTML, so the structure is visible next to the CSS that styles it. `view.ts` throws when an element it needs is missing, instead of failing later on `null`.

### 2. Redraw from state after every turn

`render(view, game)` rebuilds every cell's contents, the score, the preview and the game-over message from a `Game`. After each turn's animation, `main.ts` sets the new state and calls `render`, inside a `finally`, so even a failing animation leaves the screen matching the state (the error still reaches the console). The animation code therefore only has to look right while it runs; it never has to leave a correct end state.

Alternative considered: patch the DOM event by event and never redraw. It saves rebuilding 81 small cells per turn, but any slip in the patching would leave the screen wrong for the rest of the game.

### 3. Balls are elements that fill their cell

- The board is a CSS grid of 81 cells with no gaps and no borders; the bevel is an inset `box-shadow`, which takes no space.
- A ball is an element with `position: absolute; inset: 0` in its cell, so its box is exactly one cell. The sphere is its `::before` pseudo-element: layered radial gradients over the ball's colour, set per colour class `c1`–`c7`.
- A next ball is the same element with the class `next`, which scales the sphere down.

Because a ball's box is one cell, `translate(100%, 0)` moves it exactly one cell to the right at any board size. That lets the walk animation work in percentages, with no measuring and nothing to redo when the window is resized.

Alternative considered: one absolutely positioned layer for all balls above the cells. It needs its own coordinate maths, and the cells and balls could disagree.

### 4. Turn animation

`playTurn(view, turn, score)` awaits one animation step per event:

| Event | On screen |
|---|---|
| `moved` | the ball gets the class `moving` (raised above other cells) and animates `transform` through one `translate` keyframe per path cell, linearly, about 35 ms per cell; then the element moves into the destination cell, replacing any small ball there |
| `jumped` | a small ball pops in at its new cell |
| `removed` | the score shows the running total; the balls scale to 0 and fade, then are taken out |
| `appeared` | full balls replace the small ones and grow from the next-ball scale to full size |
| `refilled` | full balls pop in from scale 0 |
| `chosen` | the preview updates and small balls pop in |
| `over` | nothing; the redraw shows the game-over message |

- Animations use no `fill`. The moved element is put into its new cell as soon as `finished` resolves. That promise resolves during the browser's animation update, before the next paint, so the ball never flashes back to its old cell.
- The scale a next ball grows from (0.4) is written in two places: `.ball.next` in `style.css` and `animate.ts`. Each mentions the other.
- **Reduced motion:** each animation's duration becomes 0 when `matchMedia('(prefers-reduced-motion: reduce)')` matches, checked at every step, so changing the setting takes effect on the next turn.

### 5. Selection is a class; the bounce is CSS

`main.ts` keeps the selected cell's index and puts the class `selected` on that cell. CSS highlights the cell and bounces its ball with a looping `@keyframes` animation, which a `prefers-reduced-motion` media query switches off. A looping state indicator belongs to the state, so the browser starts and stops it with the class and no script has to track it. The Web Animations API is used for the turn's steps, which have to run in order and be awaited.

### 6. Input

- One `click` listener per cell, bound to the cell's index. `click` fires the same for mouse, touchpad and touch, and isn't fired when a finger drags.
- `touch-action: manipulation` on the body turns off double-tap zoom, so quick taps aren't delayed or swallowed. Pinch zoom still works.
- A `busy` flag ignores taps and New game while a turn plays, which keeps `move` from running on a state the screen doesn't show yet.
- Randomness is `Math.random`.

### 7. Layout

```
--gutter: 16px;  --bar: 48px;
--board: min(100dvw - 2 × gutter, 100dvh - bar - 3 × gutter)
```

The page is one column `var(--board)` wide: the bar, then the board with `aspect-ratio: 1`. The game-over message sits over the board in the same grid area. `dvw` and `dvh` follow the visible viewport on phones, whose browser bars come and go. The body doesn't scroll.

### 8. The URL guard learns CSS

`test/site.test.ts` gets a finder for `.css` files that collects `url(...)` targets, quoted or not, and `@import` strings. Without it, the guard fails on `style.css` as an unknown file type, as designed.

### 9. Checking the UI

No unit tests for `src/ui/` or `main.ts` (see the proposal). Instead:
- `npm run build` type-checks them under the same strict options as the rules;
- a throwaway script in the scratchpad, not the repository, drives the local headless Chrome over the DevTools protocol with Node's built-in `WebSocket`: it opens the page at phone and desktop sizes, takes screenshots, taps balls and cells, and reads console errors;
- the maintainer plays it on a phone and a desktop before merging.

## Risks / Trade-offs

- **UI code without automated tests** → it stays thin: no rule logic, and a full redraw after each turn. The rules carry the risk and keep their 100% coverage gate.
- **The next-ball scale lives in two files** → both places mention each other; a mismatch only makes the growth start at a slightly different size.
- **Header text on very narrow screens** (under about 320 px) could crowd → the bar's three items are short; checked at a 360 px width.
- **A turn's animation can't be interrupted** → turns last well under a second; New game waits for the current turn.
