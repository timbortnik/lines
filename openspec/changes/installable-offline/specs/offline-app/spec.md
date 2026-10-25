# Spec Delta

## Purpose

Lets players install the game and play it without a network after their first visit, while every online load gets the latest published files.

## ADDED Requirements

### Requirement: Installable
The site SHALL provide a web app manifest that names the game, opens it at the game page in its own window, sets its colors, and gives icons of 192 and 512 pixels, including one that platforms may mask to their own shape. The page SHALL declare an icon.

#### Scenario: Install check
- **WHEN** Chrome checks the published page for installability
- **THEN** it reports no installability errors

#### Scenario: Page icon
- **WHEN** a browser loads the page
- **THEN** it shows the game's icon and doesn't request `/favicon.ico`

### Requirement: Playable offline after the first visit
After one visit over HTTPS or on localhost, in a browser that supports service workers, the game SHALL open and play without a network, saving included.

#### Scenario: No network
- **WHEN** the player has visited the game once and opens it again with no network
- **THEN** the game loads, resumes the saved game, and plays and saves turns as usual

#### Scenario: No service worker support
- **WHEN** the browser can't run service workers, for example over plain HTTP on a local network
- **THEN** the game still plays online, and the console notes that offline play is unavailable

### Requirement: Latest files when online
Every online load SHALL check the server for newer files, despite the hosting letting browsers reuse files for 10 minutes, so that a page gets all its files from the same, latest deploy.

#### Scenario: Load after a deploy
- **WHEN** a player who visited before a deploy loads the game again, online, within 10 minutes of that deploy
- **THEN** every file comes from the new deploy

### Requirement: Slow network falls back to the cache
When the server doesn't answer within 3 seconds, a file the game has stored SHALL be used instead, and the stored copy SHALL be updated once the server answers.

#### Scenario: Server slow to answer
- **WHEN** the player has visited before and the server takes longer than 3 seconds to answer
- **THEN** the game loads from its stored files within about 3 seconds

### Requirement: Offline file list matches the site
The list of files stored for offline use SHALL name exactly the files the game needs, and the test command SHALL fail when it doesn't.

#### Scenario: File added to the site
- **WHEN** a file is added to the site or a module to the browser code, without adding it to the offline file list
- **THEN** the test command fails

#### Scenario: Listed file removed
- **WHEN** a listed file no longer exists
- **THEN** the test command fails
