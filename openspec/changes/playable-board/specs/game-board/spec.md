# Spec Delta

## Purpose

Defines what the player sees and does in the browser: the game screen, selecting and moving balls, how turns are animated, game over and new game, and the layout on phones and desktops.

## ADDED Requirements

### Requirement: Game screen
The page SHALL show a bar with the score, a preview of the next balls' colors and a New game button, and below it the 9×9 board. Every ball SHALL appear on its cell in its color, and every next ball SHALL appear small on its cell. Opening the page SHALL start a new game.

#### Scenario: Page opened
- **WHEN** a player opens the game
- **THEN** a new game is shown: its balls on the board, its next balls small on their cells and in the preview, and a score of 0

### Requirement: Selecting a ball
Tapping or clicking a ball SHALL select it, and the selected ball SHALL be marked visibly. Tapping another ball SHALL select that one instead, and tapping the selected ball SHALL drop the selection.

#### Scenario: Ball tapped
- **WHEN** the player taps a ball while none is selected
- **THEN** that ball is selected and bounces

#### Scenario: Another ball tapped
- **WHEN** the player taps a different ball while one is selected
- **THEN** the new ball is selected and the previous one no longer is

#### Scenario: Selected ball tapped again
- **WHEN** the player taps the selected ball
- **THEN** no ball is selected

### Requirement: Moving a ball
With a ball selected, tapping a cell without a ball, including a cell holding a small next ball, SHALL play the move to that cell when a free path leads there. When no free path leads there, nothing SHALL change and the ball SHALL stay selected.

#### Scenario: Reachable cell tapped
- **WHEN** a ball is selected and the player taps a cell without a ball that a free path reaches
- **THEN** the move is played and the selection ends

#### Scenario: Unreachable cell tapped
- **WHEN** a ball is selected and the player taps a cell without a ball that no free path reaches
- **THEN** the board and score stay as they were and the ball stays selected

#### Scenario: Empty cell tapped with nothing selected
- **WHEN** no ball is selected and the player taps a cell without a ball
- **THEN** nothing happens

### Requirement: Animated turns
A move SHALL be animated in the order the turn happened: the ball walks along its path, a covered next ball jumps, removed balls shrink away while the score counts up, appearing balls grow to full size, and new next balls appear small. Afterwards the board, score and preview SHALL match the new game state. Taps SHALL be ignored while a turn is animated.

#### Scenario: Move that removes a line
- **WHEN** a move completes a line
- **THEN** the ball walks to its cell, the line shrinks away and the score shows the points gained

#### Scenario: Move that removes nothing
- **WHEN** a move completes no line
- **THEN** the ball walks to its cell, the next balls grow to full size, and new next balls appear small on the board and in the preview

#### Scenario: Tap during a turn
- **WHEN** the player taps the board or the New game button while a turn is animated
- **THEN** the tap is ignored

### Requirement: Reduced motion
When the player's system asks for reduced motion, turns SHALL be shown at once without animation, and the selected ball SHALL be marked without bouncing.

#### Scenario: Reduced motion requested
- **WHEN** the system asks for reduced motion and the player selects a ball and moves it
- **THEN** the selected ball is highlighted without bouncing, and the board shows the result of the turn at once

### Requirement: Game over
When a turn ends the game, the page SHALL show that the game is over, with the final score and a button that starts a new game. Taps on the board SHALL then do nothing.

#### Scenario: Board fills up
- **WHEN** a turn fills the board
- **THEN** a game-over message with the final score and a New game button is shown over the board

### Requirement: New game
The New game buttons SHALL start a new game at once, without asking for confirmation, and drop any selection.

#### Scenario: New game during play
- **WHEN** the player presses New game during a game
- **THEN** a new game is shown with a score of 0

#### Scenario: New game after game over
- **WHEN** the player presses New game in the game-over message
- **THEN** the message closes and a new game is shown

### Requirement: Fits the screen
The board SHALL be square and as large as the screen allows below the bar, in portrait and in landscape, without scrolling. Mouse, touchpad and touch SHALL work the same, and double-tapping SHALL NOT zoom the page.

#### Scenario: Phone in portrait
- **WHEN** the game is opened on a phone held upright
- **THEN** the bar and the whole board are visible without scrolling, and the board spans the screen's width minus a margin

#### Scenario: Desktop window
- **WHEN** the game is opened in a desktop browser window that is wider than it is tall
- **THEN** the bar and the whole board are visible without scrolling, and the board fills the height below the bar

#### Scenario: Quick taps on a phone
- **WHEN** the player taps two cells in quick succession on a touch screen
- **THEN** both taps reach the game and the page does not zoom
