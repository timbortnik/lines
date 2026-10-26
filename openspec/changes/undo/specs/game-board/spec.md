# Spec Delta

## MODIFIED Requirements

### Requirement: Game screen
The page SHALL show a bar with the score, the best score, a preview of the next balls' colors, an Undo button and a New button, and below it the 9×9 board. Every ball SHALL appear on its cell in its color, and every next ball SHALL appear small on its cell. Opening the page SHALL resume the saved game, or start a new game when there is none to resume.

#### Scenario: Page opened
- **WHEN** a player opens the game for the first time on a device
- **THEN** a new game is shown: its balls on the board, its next balls small on their cells and in the preview, and a score of 0

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

## ADDED Requirements

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
