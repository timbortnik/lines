# Spec Delta

## Purpose

Defines how the game and the best score are kept on the player's device: when the game is saved, when it is resumed, how saved data is checked, and what happens when the device won't store anything.

## ADDED Requirements

### Requirement: Game saved on the device
The game SHALL be saved on the device as soon as a move is decided, before its animation plays, and whenever a new game starts. Opening the page SHALL resume a saved game that isn't over. Saved data SHALL NOT leave the device.

#### Scenario: Page reloaded during a game
- **WHEN** the player reloads the page during an unfinished game
- **THEN** the same board, next balls and score are shown, and no ball is selected

#### Scenario: Page closed during a turn's animation
- **WHEN** the player closes the page while a turn that doesn't end the game is animated, then opens it again
- **THEN** the game is shown as it is after that turn

### Requirement: Finished games aren't resumed
Opening the page when the saved game is over SHALL start a new game.

#### Scenario: Page opened after game over
- **WHEN** the player opens the page after the saved game ended
- **THEN** a new game is shown with a score of 0

### Requirement: Best score
The device SHALL keep a best score: the highest score of any game played on it, the current game included. A game that ends or is replaced by a new one SHALL count towards it.

#### Scenario: Best score beaten during play
- **WHEN** a turn ends with the score above the best score
- **THEN** the bar shows the current score as the best score

#### Scenario: Game over with a new best
- **WHEN** a game ends with a score above the best score of all earlier games
- **THEN** the game-over message says "New best!"

#### Scenario: Game over without a new best
- **WHEN** a game ends with a score that doesn't beat the best score of earlier games
- **THEN** the game-over message doesn't say "New best!"

#### Scenario: Abandoned game
- **WHEN** the player starts a new game during a game whose score beats the best score
- **THEN** that score becomes the best score

### Requirement: Saved data checked before use
Before play resumes, the saved data SHALL be checked: its format version, the board, the next balls, the scores, the game-over flag, and that no line of 5 is left on the board. Saved data that fails a check SHALL be ignored with a warning in the browser console, and a new game SHALL start.

#### Scenario: Damaged save
- **WHEN** the saved data is not valid JSON, or a check fails
- **THEN** a new game starts, the best score starts at 0, and the console names the problem

#### Scenario: Unknown format version
- **WHEN** the saved data has a format version this code doesn't know
- **THEN** it is ignored like a damaged save

#### Scenario: Valid save
- **WHEN** the saved data was written by the game
- **THEN** it passes every check

### Requirement: Playing without storage
When the device won't store data, because storage is blocked or full, the game SHALL play normally without saving, and SHALL warn once in the browser console.

#### Scenario: Storage blocked
- **WHEN** the browser blocks storage for the site and the player plays several turns
- **THEN** every turn plays normally and the console shows a single warning
