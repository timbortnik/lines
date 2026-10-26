# game-rules Specification

## Purpose

Defines the rules of Color Lines as this game plays them: the board, the starting position, next balls, moves, removing lines, scoring and game over, plus the turn record and game state that the interface and saving build on.

## Requirements

### Requirement: Board and colors
The board SHALL be a 9×9 grid of cells. Each cell SHALL be empty or hold one ball of one of 7 colors.

#### Scenario: New board
- **WHEN** a new game starts
- **THEN** the board has 81 cells, and every ball on it has one of the 7 colors

### Requirement: Starting position
A new game SHALL start with a score of 0 and 5 balls of random colors on random cells, none of them part of a line of 5 or more.

#### Scenario: Balls at the start
- **WHEN** a new game starts
- **THEN** exactly 5 cells hold balls, the score is 0, and no line of 5 or more same-colored balls exists

### Requirement: Next balls
The game SHALL always know up to 3 next balls. Each is chosen with a random color on a random free cell: a cell that holds no ball and no other next ball. There SHALL be fewer than 3 only when fewer free cells remained when they were chosen.

#### Scenario: Plenty of room
- **WHEN** a new game starts
- **THEN** there are 3 next balls, on 3 different empty cells

#### Scenario: Little room
- **WHEN** next balls are chosen while only 2 cells are free
- **THEN** there are 2 next balls, one on each free cell

### Requirement: Moving a ball
A ball SHALL move to an empty cell only along a path of orthogonally adjacent empty cells. Cells holding a next ball count as empty. A move that breaks these rules, or any move after the game is over, SHALL be rejected and leave the game unchanged.

#### Scenario: Reachable cell
- **WHEN** the player moves a ball to an empty cell connected to it by empty cells, stepping only up, down, left or right
- **THEN** the ball moves there along a shortest such path

#### Scenario: Walled-off cell
- **WHEN** the destination is empty but every orthogonal route to it is blocked by balls
- **THEN** the move is rejected and the game is unchanged

#### Scenario: Occupied destination or empty origin
- **WHEN** the destination holds a ball, or the origin holds none
- **THEN** the move is rejected and the game is unchanged

#### Scenario: Through a next ball
- **WHEN** the only route passes over cells holding next balls
- **THEN** the move is allowed

### Requirement: Landing on a next ball
When a ball lands on a cell holding a next ball, that next ball SHALL move to the cell the ball left, keeping its color.

#### Scenario: Next ball displaced
- **WHEN** a ball lands on the cell of a next ball
- **THEN** that next ball keeps its color and moves to the cell the ball left

### Requirement: Removing lines after a move
After a move, every line of 5 or more same-colored balls that includes the moved ball, horizontally, vertically or diagonally, SHALL be removed. When a move removes balls, the next balls SHALL NOT appear that turn, so the player moves again.

#### Scenario: Line of five
- **WHEN** a move completes a horizontal, vertical or diagonal line of 5 same-colored balls
- **THEN** those 5 balls are removed, and the next balls stay where they are

#### Scenario: Four in a row
- **WHEN** a move leaves 4 same-colored balls in a row
- **THEN** nothing is removed, and the next balls appear

#### Scenario: Crossing lines
- **WHEN** a move completes two lines at once that share the moved ball
- **THEN** every ball of both lines is removed

### Requirement: Next balls appear
When a move removes no balls, the next balls SHALL appear on their cells. Any line of 5 or more they complete SHALL be removed and scored, and new next balls SHALL then be chosen.

#### Scenario: Balls appear
- **WHEN** a move removes nothing
- **THEN** each next ball becomes a ball of its color on its cell, and new next balls are chosen

#### Scenario: Appearing balls complete a line
- **WHEN** an appearing ball completes a line of 5 or more same-colored balls
- **THEN** that line is removed and scored, and the player does not get an extra move

### Requirement: Cleared board
When a removal leaves no ball on the board, 5 new balls of random colors SHALL be placed on random cells that hold no next ball, none of them part of a line of 5 or more. The score SHALL be kept.

#### Scenario: A move clears the board
- **WHEN** a move removes the last balls on the board
- **THEN** 5 new balls appear on cells without next balls, no line of 5 or more exists, the score includes the removal, and the next balls stay where they are

#### Scenario: Appearing balls clear the board
- **WHEN** appearing balls complete a line that removes every ball on the board
- **THEN** 5 new balls are placed, and new next balls are then chosen on free cells

### Requirement: Scoring
Removing n balls at once SHALL score 10 × 2^(n−5) points. Here n counts every ball removed by one move, or by one appearance of next balls, exactly once, even where lines cross.

#### Scenario: Five balls
- **WHEN** 5 balls are removed at once
- **THEN** the score increases by 10

#### Scenario: Six balls
- **WHEN** 6 balls are removed at once
- **THEN** the score increases by 20

#### Scenario: Two crossing lines of five
- **WHEN** a move removes two lines of 5 that share one ball, 9 balls in total
- **THEN** the score increases by 160

### Requirement: Game over
The game SHALL be over when the board has no empty cell after next balls appear and any lines they complete are removed.

#### Scenario: Board fills up
- **WHEN** appearing balls fill the last empty cells without completing a line
- **THEN** the game is over, and further moves are rejected

#### Scenario: Last balls complete a line
- **WHEN** appearing balls fill the board but complete a line
- **THEN** the line is removed, and the game continues

### Requirement: Turn record
Each accepted move SHALL return the new game state together with a record of what happened, in order. The record SHALL cover the ball's path, a displaced next ball, removed balls with the points they scored, appeared balls, a fresh position after the board is cleared, the newly chosen next balls, and game over.

#### Scenario: Ordinary move
- **WHEN** a move removes nothing
- **THEN** the record lists the path, then the appeared balls, then the new next balls

#### Scenario: Move that removes a line
- **WHEN** a move removes a line
- **THEN** the record lists the path, then the removed balls with their points, and nothing appears

### Requirement: Deterministic randomness
Every random choice SHALL come from a source of random numbers the caller supplies, so that the same game state, move and random numbers always produce the same result.

#### Scenario: Replaying a move
- **WHEN** the same move is made twice from the same state with the same random numbers
- **THEN** both results are identical

### Requirement: Game state is plain data
The game state SHALL consist only of plain data that survives a JSON round trip unchanged.

#### Scenario: JSON round trip
- **WHEN** a game state is converted to JSON and back
- **THEN** the result equals the original, and play continues from it exactly as from the original
