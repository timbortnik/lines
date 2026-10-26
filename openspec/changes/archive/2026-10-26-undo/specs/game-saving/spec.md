# Spec Delta

## MODIFIED Requirements

### Requirement: Game saved on the device
The game SHALL be saved on the device as soon as a move is decided, before its animation plays, whenever a new game starts, and after an undo. Opening the page SHALL resume a saved game that isn't over. Saved data SHALL NOT leave the device.

#### Scenario: Page reloaded during a game
- **WHEN** the player reloads the page during an unfinished game
- **THEN** the same board, next balls and score are shown, and no ball is selected

#### Scenario: Page closed during a turn's animation
- **WHEN** the player closes the page while a turn that doesn't end the game is animated, then opens it again
- **THEN** the game is shown as it is after that turn

#### Scenario: Page reloaded after an undo
- **WHEN** the player undoes a move, then reloads the page
- **THEN** the game is shown as it was before the undone move
