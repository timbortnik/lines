# Spec Delta

## ADDED Requirements

### Requirement: Unused code fails the build
The build and test commands SHALL fail when code has an unused local variable or parameter, a code path that returns no value where one is required, or a switch case that falls through. A parameter whose name starts with an underscore SHALL count as deliberately unused.

#### Scenario: Unused variable
- **WHEN** a source or test file declares a local variable that is never read
- **THEN** the build or test command fails with a type error

#### Scenario: Unused parameter
- **WHEN** a function has a parameter that is never read and whose name doesn't start with an underscore
- **THEN** the build or test command fails with a type error

#### Scenario: Deliberately unused parameter
- **WHEN** a parameter that is never read has a name starting with an underscore, such as `_event`
- **THEN** it compiles

#### Scenario: Switch fall-through
- **WHEN** a non-empty switch case falls through into the next one
- **THEN** the build or test command fails with a type error

### Requirement: Weekly scheduled testing
The tests and the build SHALL also run once a week on the main branch without any push, so that breakage caused outside the repository, such as a new Node.js LTS, is reported while the repository is active. A scheduled run SHALL NOT publish the site.

#### Scenario: A week without pushes
- **WHEN** a week passes without a push to main
- **THEN** the tests and the build run on main on both Node.js versions and report their result

#### Scenario: Scheduled run passes
- **WHEN** a scheduled run passes
- **THEN** the published site is left unchanged

## MODIFIED Requirements

### Requirement: Continuous testing
Every push and every pull request SHALL run the tests and the build on Node.js 22 and on the current Node.js LTS, and report the result on the commit or pull request. Each Node.js version SHALL report its own result, even when the other fails.

#### Scenario: Pull request with a failing test
- **WHEN** a pull request contains a failing test on either Node.js version
- **THEN** its check is reported as failed

#### Scenario: Push with passing tests
- **WHEN** a commit is pushed and the tests and build pass on both Node.js versions
- **THEN** its check is reported as passed

#### Scenario: One Node.js version fails
- **WHEN** the tests fail on one Node.js version
- **THEN** the other version still runs to completion and reports its own result, rather than being cancelled
