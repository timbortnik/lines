# game-board Specification

## Purpose

Defines what the player sees and does in the browser: the game screen, selecting and moving balls, how turns are animated, undoing a move, game over and new game, and the layout on phones and desktops.

## Requirements

### Requirement: Game screen
The page SHALL show a bar with the score, the best score, a preview of the next balls' colors, an Undo button and a New button, and below it the 9×9 board. Every ball SHALL appear on its cell in its color, and every next ball SHALL appear small on its cell. Opening the page SHALL resume the saved game, or start a new game when there is none to resume.

#### Scenario: Page opened
- **WHEN** a player opens the game for the first time on a device
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
A move SHALL be animated in the order the turn happened: the ball walks along its path, a covered next ball jumps, removed balls shrink away while the score adds their points, appearing balls grow to full size, and new next balls appear small. Afterwards the board, score and preview SHALL match the new game state. Taps SHALL be ignored while a turn is animated.

#### Scenario: Move that removes a line
- **WHEN** a move completes a line
- **THEN** the ball walks to its cell, the line shrinks away and the score shows the points gained

#### Scenario: Move that removes nothing
- **WHEN** a move completes no line
- **THEN** the ball walks to its cell, the next balls grow to full size, and new next balls appear small on the board and in the preview

#### Scenario: Tap during a turn
- **WHEN** the player taps the board, the Undo button or the New button while a turn is animated
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
During an unfinished game, the New button in the bar SHALL ask for confirmation in a dialog with a Keep playing and a New game button. After game over, the New button and the New game button in the game-over message SHALL start a new game at once. Starting a new game SHALL drop any selection.

#### Scenario: New game during play
- **WHEN** the player presses New in the bar during an unfinished game
- **THEN** a dialog asks whether to start a new game, and the board can't be played until it closes

#### Scenario: New game confirmed
- **WHEN** the player chooses New game in the dialog
- **THEN** a new game is shown with a score of 0

#### Scenario: Keep playing
- **WHEN** the player chooses Keep playing, or closes the dialog with the Escape key
- **THEN** the game continues unchanged

#### Scenario: New game after game over
- **WHEN** the player presses New game in the game-over message
- **THEN** the message closes and a new game is shown, without a dialog

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

### Requirement: Undo
The Undo button in the bar SHALL take back the last move: the board, the next balls, the score and the best score SHALL return to what they were before it, at once and without animation, and any selection SHALL be dropped. Undo SHALL also take back a move that ended the game.

#### Scenario: Move undone
- **WHEN** the player presses Undo after a move, with a ball selected
- **THEN** the board, the next balls on the board and in the preview, and the score are as they were before the move, and no ball is selected

#### Scenario: Game over undone
- **WHEN** the player presses Undo after the move that ended the game
- **THEN** the game-over message closes, the game is as it was before that move, and it can be played on

### Requirement: When Undo is available
Undo SHALL be available only for the last move, and not for a move played right after an undo, so that each draw of new next balls gets at most one retry. A new game SHALL have nothing to undo. A game resumed when the page opens SHALL be treated as just undone, since its save may have been written by an undo. When Undo isn't available, its button SHALL be shown disabled and SHALL do nothing.

#### Scenario: New game
- **WHEN** a new game starts
- **THEN** the Undo button is disabled until the first move

#### Scenario: After an undo
- **WHEN** the player has just undone a move
- **THEN** the Undo button is disabled

#### Scenario: Move right after an undo
- **WHEN** the player undoes a move, plays a move, then plays another
- **THEN** the Undo button stays disabled after the first of those moves, and is enabled after the second

#### Scenario: Game resumed
- **WHEN** the page opens on a saved game, and the player plays a move, then another
- **THEN** the Undo button stays disabled until the second move
