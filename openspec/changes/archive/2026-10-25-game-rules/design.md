# Design

## Context

There is no game code yet: `src/main.ts` is a placeholder. The test build compiles `test/` and the `src/` modules the tests import, without the DOM library. Since `quality-controls`, the compiler also rejects unused locals and parameters, partial returns and switch fall-through. See proposal.md for the motivation. Facts checked while planning:

- **Node versions:** in Node's docs, `--test-coverage-include` was added in v22.5.0, and `--test-coverage-lines`, `--test-coverage-branches` and `--test-coverage-functions` in v22.8.0. The pre-review confirmed the behaviour on an official v22.8.0.
- **Experiments on the maintainer's Node 22.22.1**, in the scratchpad:
  - The include pattern must start with `**/`. Coverage reports absolute, source-mapped `.ts` paths, so `src/**` matches nothing and passes at 100%.
  - **A rules module that no test imports is invisible to coverage.** That holds even when it's compiled: the report shows 100% and passes.
  - **A guard test that loads every rules module fixes this.** With it, the untested module shows 25% line coverage and the run fails. With a test for that module, it passes at 100%.
- **Gaps the pre-review found:**
  - A function that no test calls still passes 100% lines and branches; function coverage is what catches it.
  - Untested files in subfolders slip past a guard that only lists the top level.
  - `node:coverage` ignore comments hide untested code from the report.

## Goals / Non-Goals

**Goals:**
- The rules in `specs/game-rules/spec.md`, as a small pure module that is easy to read and test.
- An API that `playable-board` can animate from, and a state that `save-and-resume` can store as it is.
- A coverage gate that can't pass vacuously.

**Non-Goals:**
- Validating saved data from storage; that's `save-and-resume`.
- Performance work. A 9×9 board is tiny.

## Decisions

### 1. Module layout

```
src/game/board.ts    geometry: size, colors, cell ↔ row/column, neighbours
src/game/path.ts     findPath: shortest route through empty cells
src/game/lines.ts    findLines: lines of 5+ through given cells
src/game/game.ts     the Game state, newGame and move, scoring, the turn record
test/game/           one test file per module, plus the guard that loads every module
```

Each file has one job and stays small, which keeps 100% coverage natural rather than forced.

### 2. Game state

```ts
interface Ball { cell: number; color: number }   // cell 0–80, row by row; color 1–7
interface Game { board: number[]; next: Ball[]; score: number; over: boolean }
```

- `board` holds 81 numbers: 0 for an empty cell, otherwise the ball's color.
- `next` lists the next balls.
- It's plain data, so JSON round-trips it and `save-and-resume` can store it directly.

Alternatives considered:
- A 9×9 nested array: more nesting, and no simpler.
- Classes: not plain data.

### 3. API

- `newGame(random: Random): Game`
- `move(game: Game, from: number, to: number, random: Random): Turn | null`
- `findPath(board: number[], from: number, to: number): number[] | null`, exported so the interface can use it later.

`Random` is `() => number`, returning floats in [0, 1), like `Math.random`. It's always passed in, never defaulted, so randomness is explicit everywhere: the interface passes `Math.random`, and tests pass a seeded generator kept in a test helper.

`move` never changes its input game; it returns a new one, or `null` for a rejected move. The interface can call `findPath` to tell "no route" apart from other cases.

Alternative considered: a result object with a rejection reason. Nothing needs the reason yet.

### 4. Turn record

```ts
type TurnEvent =
  | { type: 'moved'; path: number[] }
  | { type: 'jumped'; from: number; to: number; color: number }
  | { type: 'removed'; cells: number[]; points: number }
  | { type: 'appeared'; balls: Ball[] }
  | { type: 'refilled'; balls: Ball[] }
  | { type: 'chosen'; balls: Ball[] }
  | { type: 'over' };
interface Turn { game: Game; events: TurnEvent[] }
```

The events come in the order they happen, and `playable-board` animates them one by one: the ball travels the path, a displaced next ball hops, removed balls shrink, next balls grow, new next balls appear.

Alternative considered: a snapshot of the whole board after each phase. It's heavier, and the interface would have to work out what changed.

### 5. How a move plays out

1. **Reject** the move if the game is over, the origin is empty, the destination holds a ball, or `findPath` finds no route.
2. **Find the route.** `findPath` is a breadth-first search over orthogonal neighbours in a fixed order, so the path is a shortest one and the same every time. Cells holding next balls count as empty.
3. **Move the ball.** If it lands on a next ball, that next ball moves to a random free cell. One always exists, because the moving ball just left one.
4. **Remove lines through the moved ball.** `findLines` checks the 4 directions from that cell. If anything is removed, score 10 × 2^(n−5) for the n removed cells and stop: the player moves again.
5. **Otherwise, the next balls appear.** Remove the union of the lines through all appeared balls, score it, and choose up to 3 new next balls on free cells. The game is over if the board has no empty cell.

**Cleared board:** whenever a removal, in step 4 or step 5, leaves no ball on the board, place a fresh set of 5 balls on cells without next balls, using the same placement as a new game. Record it as `refilled`, and keep the score. In step 5 this happens before the new next balls are chosen. The maintainer chose this over making the next balls appear at once, or ending the game.

**Starting position:** place 5 balls, and redraw if they happen to form a line. That's rare, and still deterministic for a given random source.

### 6. Coverage gate

- **`test/tsconfig.json`** includes `../src/game` as well as the tests. Every rules module is then compiled into `build/`, and type-checked without the DOM library, even before a test imports it.
- **The guard test** `test/game/modules.test.ts` lists every `.ts` file under `src/game/`, recursively, and imports each compiled module, so coverage measures them all. It fails closed:
  - if it finds no files;
  - if any file contains `node:coverage`. Ignore comments would let untested code through, so code that can't be tested is removed instead.
- **The `test` script** runs `node --test` with `--experimental-test-coverage --test-coverage-include="**/src/game/**" --test-coverage-lines=100 --test-coverage-branches=100 --test-coverage-functions=100`.
- **Minimum Node version:** the thresholds need Node 22.8, so `engines.node` becomes `>=22.8` in `package.json` and `package-lock.json`. The project context and README change to match. CI's `22` already resolves to the latest 22.x.

Alternatives considered:
- A coverage gate only in CI: local test runs would stay unguarded.
- c8 or istanbul: new dependencies.
- Keeping Node 22.0–22.7: those releases can't enforce thresholds.

### 7. `noUncheckedIndexedAccess` stays off

Board lookups would need non-null assertions everywhere. With 100% branch coverage over a fixed 81-cell array, out-of-range mistakes would show up in tests.

## Risks / Trade-offs

- [Test coverage is still marked experimental in Node] → CI runs the latest Node 22 and LTS, so a change in behaviour shows up there first. The gate's own tests (task 1.2) prove that it fails.
- [100% branch coverage tempts contrived tests or defensive code no test can reach] → Treat an unreachable branch as dead code and remove it.
- [Tests that pin exact random draws break when the order of draws changes] → Tests assert outcomes (counts, cells, colors, scores). Only the determinism test compares two runs with each other.

## Migration Plan

Nothing to migrate: the module is new, and nothing uses it until `playable-board`.

## Open Questions

None.
