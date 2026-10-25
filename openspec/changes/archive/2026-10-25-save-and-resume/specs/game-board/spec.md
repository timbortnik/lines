# Spec Delta

## MODIFIED Requirements

### Requirement: Game screen
The page SHALL show a bar with the score, the best score, a preview of the next balls' colors and a New game button, and below it the 9×9 board. Every ball SHALL appear on its cell in its color, and every next ball SHALL appear small on its cell. Opening the page SHALL resume the saved game, or start a new game when there is none to resume.

#### Scenario: Page opened
- **WHEN** a player opens the game for the first time on a device
- **THEN** a new game is shown: its balls on the board, its next balls small on their cells and in the preview, and a score of 0

### Requirement: New game
During an unfinished game, the New game button in the bar SHALL ask for confirmation in a dialog with a Keep playing and a New game button. After game over, the New game buttons SHALL start a new game at once. Starting a new game SHALL drop any selection.

#### Scenario: New game during play
- **WHEN** the player presses New game during an unfinished game
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
