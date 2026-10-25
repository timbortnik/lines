# build-and-test Specification

## Purpose

Defines how contributors and CI build and test the project: which Node.js versions are supported, which commands exist, what makes them fail, and which dependencies the project may have.

## Requirements

### Requirement: Supported Node.js versions
Building and testing SHALL work on Node.js 22.8 or newer, including Node.js builds that cannot execute TypeScript files directly.

#### Scenario: Node.js 22 without TypeScript support
- **WHEN** a contributor runs the test command on a Node.js 22.8 or newer build that cannot execute TypeScript files
- **THEN** the tests compile and run with the same results as on any other supported version

#### Scenario: Current Node.js LTS
- **WHEN** a contributor runs the build and test commands on the current Node.js LTS release
- **THEN** both commands succeed

### Requirement: Single test command
The project SHALL provide one test command that compiles the tests together with the code they exercise and then runs them. It SHALL fail when any test fails or any compiled file has a type error.

#### Scenario: All tests pass
- **WHEN** a contributor runs the test command and every test passes
- **THEN** the command exits with status 0

#### Scenario: A test fails
- **WHEN** a contributor runs the test command and a test fails
- **THEN** the command exits with a non-zero status
- **AND** the failure report points to the line in the TypeScript test source

#### Scenario: A test is deleted
- **WHEN** a test file is deleted or renamed
- **THEN** the next run of the test command no longer runs it under its old name

#### Scenario: Type error in tested code
- **WHEN** a test or a module it imports has a type error
- **THEN** the test command exits with a non-zero status without running any tests

### Requirement: Single build command
The project SHALL provide one build command that compiles the browser code into the folder that gets published, and fails on any type error.

#### Scenario: Successful build
- **WHEN** a contributor runs the build command on code without type errors
- **THEN** the compiled ES modules appear in the published folder, next to the static files that load them

#### Scenario: Type error in browser code
- **WHEN** the browser code has a type error
- **THEN** the build command exits with a non-zero status

### Requirement: Tested modules are checked without the DOM library
Every module the tests import SHALL be type-checked without the browser DOM library, so that references to `document`, `window` or DOM element types fail the test build.

#### Scenario: A tested module uses the DOM
- **WHEN** a module imported by a test refers to a DOM API such as `document`
- **THEN** the test command fails with a type error

### Requirement: Minimal dependencies
The project SHALL have no runtime dependencies. Its development dependencies SHALL be exactly the TypeScript compiler and the Node.js type definitions. A change to that list SHALL require editing the test that guards it, so the change is explicit in review.

#### Scenario: Only the allowed development dependencies
- **WHEN** the test command runs on a project with no runtime dependencies and only the two allowed development dependencies
- **THEN** the dependency check passes

#### Scenario: A dependency is added
- **WHEN** any other dependency, of any kind (runtime, optional, peer or development), is added to the package manifest
- **THEN** the test command fails until the dependency guard is updated deliberately

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

### Requirement: Unused code fails the build
The build and test commands SHALL fail when code has an unused local variable or parameter, a function that returns a value on only some of its paths, or a switch case that falls through. A parameter whose name starts with an underscore SHALL count as deliberately unused.

#### Scenario: Unused variable
- **WHEN** a source or test file declares a local variable that is never read
- **THEN** the build or test command fails with a type error

#### Scenario: Unused parameter
- **WHEN** a function has a parameter that is never read and whose name doesn't start with an underscore
- **THEN** the build or test command fails with a type error

#### Scenario: Deliberately unused parameter
- **WHEN** a parameter that is never read has a name starting with an underscore, such as `_event`
- **THEN** it compiles

#### Scenario: Value returned on only some paths
- **WHEN** a function returns a value on some of its code paths and nothing on others
- **THEN** the build or test command fails with a type error

#### Scenario: Switch fall-through
- **WHEN** a non-empty switch case falls through into the next one
- **THEN** the build or test command fails with a type error

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
