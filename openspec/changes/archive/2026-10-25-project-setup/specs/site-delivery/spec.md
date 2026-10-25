# Spec Delta

## Purpose

Defines how the game reaches players: the permanent public address, secure delivery, how changes enter the main branch, automatic publishing from it once tests pass, and what the published site may contain.

## ADDED Requirements

### Requirement: Permanent public address
The game SHALL be served at https://lines.bortnik.org. The address SHALL NOT change, because saved games and installed copies are tied to it.

#### Scenario: Player opens the game
- **WHEN** a player opens https://lines.bortnik.org
- **THEN** the latest published version of the site loads

### Requirement: HTTPS only
The site SHALL be delivered only over HTTPS.

#### Scenario: Plain HTTP request
- **WHEN** a player opens http://lines.bortnik.org
- **THEN** the request is redirected to https://lines.bortnik.org

### Requirement: Publishing gated by tests
Every push to the main branch SHALL publish the site automatically, but only after the tests and build pass. Other branches and pull requests SHALL NOT publish.

#### Scenario: Passing push to main
- **WHEN** a commit is pushed to main and the tests and build pass
- **THEN** the site at the public address is updated to that commit

#### Scenario: Failing push to main
- **WHEN** a commit is pushed to main and the tests or the build fail
- **THEN** the published site stays at the previous version

#### Scenario: Pull request
- **WHEN** a pull request is opened or updated
- **THEN** the site is not published

### Requirement: Changes reach main only through checked pull requests
Changes SHALL reach the main branch only through pull requests, merged by squashing after the tests and build pass on both supported Node.js versions. Pushing directly to main, rewriting its history and deleting it SHALL be rejected.

#### Scenario: Pull request with failing checks
- **WHEN** a pull request's tests or build fail on either Node.js version
- **THEN** it cannot be merged into main

#### Scenario: Pull request with passing checks
- **WHEN** all required checks pass
- **THEN** the pull request can be squash-merged, adding exactly one commit to main

#### Scenario: Direct push to main
- **WHEN** someone pushes commits directly to main
- **THEN** the push is rejected

### Requirement: Relative URLs only
The published pages SHALL refer to the site's own files with relative URLs only, so the site works both at a domain root and under a subpath.

#### Scenario: Served under a subpath
- **WHEN** the site is served under a subpath instead of a domain root
- **THEN** every file the pages refer to still loads

#### Scenario: Absolute URL introduced
- **WHEN** a page refers to a file with a root-relative or absolute URL
- **THEN** the test command fails

### Requirement: Only the site is published
Only the contents of the site folder, including the compiled browser code, SHALL be published. Source files, tests, specs and other repository files SHALL NOT be served.

#### Scenario: Repository file requested
- **WHEN** someone requests a repository file that is not part of the site, such as a TypeScript source or a test
- **THEN** it is not found
