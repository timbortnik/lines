# Spec Delta

## Purpose

Defines how security problems in the repository are reported, detected and kept out: private vulnerability reporting, code scanning, blocking pushed secrets, and alerts for vulnerable dependencies.

## ADDED Requirements

### Requirement: Private vulnerability reporting
Anyone SHALL be able to report a security vulnerability privately to the maintainers through GitHub, and the repository's security policy SHALL explain how.

#### Scenario: Reading the security policy
- **WHEN** a visitor opens the repository's security policy
- **THEN** it tells them to report vulnerabilities privately through GitHub rather than in public issues

#### Scenario: Reporting a vulnerability
- **WHEN** a visitor chooses "Report a vulnerability" on the repository's "Security and quality" tab
- **THEN** GitHub opens a private advisory form whose contents only the reporter and the maintainers can see

### Requirement: Code scanning
The repository's JavaScript and TypeScript code SHALL be scanned by CodeQL on pushes to main, on pull requests, and on a weekly schedule.

#### Scenario: Pull request
- **WHEN** a pull request is opened or updated
- **THEN** a CodeQL analysis runs on it and reports its result

### Requirement: Secrets blocked at push
A push that contains a secret GitHub recognises, such as an access token, SHALL be rejected.

#### Scenario: Secret in a commit
- **WHEN** someone pushes a commit containing a recognised secret
- **THEN** GitHub blocks the push and explains why

### Requirement: Alerts for vulnerable dependencies
A known vulnerability in one of the project's dependencies SHALL raise an alert and a pull request that updates to a fixed version. Routine version updates SHALL NOT open pull requests.

#### Scenario: Vulnerable dependency
- **WHEN** a vulnerability is published for a dependency version in the lockfile
- **THEN** a Dependabot alert appears, and Dependabot opens a pull request with a fixed version

#### Scenario: Ordinary new release
- **WHEN** a dependency publishes a new version that fixes no known vulnerability
- **THEN** no pull request is opened
