# Spec Delta

## MODIFIED Requirements

### Requirement: Next balls
The game SHALL always know up to 3 next balls. Each is chosen with a random color on a random free cell: a cell that holds no ball and no other next ball. There SHALL be fewer than 3 only when fewer free cells remained when they were chosen.

#### Scenario: Plenty of room
- **WHEN** a new game starts
- **THEN** there are 3 next balls, on 3 different empty cells

#### Scenario: Little room
- **WHEN** next balls are chosen while only 2 cells are free
- **THEN** there are 2 next balls, one on each free cell

### Requirement: Landing on a next ball
When a ball lands on a cell holding a next ball, that next ball SHALL move to the cell the ball left, keeping its color.

#### Scenario: Next ball displaced
- **WHEN** a ball lands on the cell of a next ball
- **THEN** that next ball keeps its color and moves to the cell the ball left
