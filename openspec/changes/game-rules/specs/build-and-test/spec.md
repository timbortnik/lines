# Spec Delta

## ADDED Requirements

### Requirement: Rules module fully covered
The test command SHALL fail when the tests leave any line, branch or function of the rules module unexecuted, including in rules modules that no test imports. It SHALL also fail when a rules module contains a comment that switches coverage off.

#### Scenario: Untested branch
- **WHEN** a rules module has a branch that no test executes
- **THEN** the test command fails

#### Scenario: Function never called
- **WHEN** a rules module has a function that no test calls
- **THEN** the test command fails

#### Scenario: Module no test imports
- **WHEN** a rules module exists that no test imports, at any depth under the rules folder
- **THEN** the test command fails instead of leaving the module out of the coverage report

#### Scenario: Coverage switched off
- **WHEN** a rules module contains a `node:coverage` comment
- **THEN** the test command fails

#### Scenario: Fully covered
- **WHEN** the tests execute every line, branch and function of the rules module
- **THEN** the coverage check passes

## MODIFIED Requirements

### Requirement: Supported Node.js versions
Building and testing SHALL work on Node.js 22.8 or newer, including Node.js builds that cannot execute TypeScript files directly.

#### Scenario: Node.js 22 without TypeScript support
- **WHEN** a contributor runs the test command on a Node.js 22.8 or newer build that cannot execute TypeScript files
- **THEN** the tests compile and run with the same results as on any other supported version

#### Scenario: Current Node.js LTS
- **WHEN** a contributor runs the build and test commands on the current Node.js LTS release
- **THEN** both commands succeed
