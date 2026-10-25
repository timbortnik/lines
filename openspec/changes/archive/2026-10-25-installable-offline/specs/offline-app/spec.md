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
Every online load SHALL check the server for newer files, despite the hosting letting browsers reuse files for 10 minutes, so that a page gets all its files from the latest deploy.

#### Scenario: Return after a deploy
- **WHEN** a player who visited before a deploy opens the game again, online, within 10 minutes of their visit
- **THEN** every file comes from the new deploy

#### Scenario: Reload in the same tab after a deploy
- **WHEN** a player reloads the game's tab, online, within 10 minutes of its last load and after a deploy
- **THEN** every file comes from the new deploy

### Requirement: Files of one deploy
A page load SHALL take all its files from one place: the server, or the stored files. The stored files SHALL be replaced only as a whole set, after a load the server answered.

#### Scenario: Refresh interrupted
- **WHEN** refreshing the stored files fails partway, for example because the connection drops
- **THEN** the previous complete set stays stored

#### Scenario: Next offline load after a deploy
- **WHEN** the player loaded the game online after a deploy, and later opens it without a network
- **THEN** the game loads with every file from that deploy

### Requirement: Slow server falls back to the stored files
When the server doesn't answer the page request within 3 seconds, the game SHALL load from its stored files, and they SHALL be refreshed once the server answers.

#### Scenario: Server slow to answer
- **WHEN** the player has visited before and the server takes longer than 3 seconds to answer
- **THEN** the game loads from its stored files in about 3 seconds, not waiting again for each file

### Requirement: Offline file list matches the site
The list of files stored for offline use SHALL name exactly the files the game needs, and the test command SHALL fail when it doesn't.

#### Scenario: File added to the site
- **WHEN** a file is added to the site or a module to the browser code, without adding it to the offline file list
- **THEN** the test command fails

#### Scenario: Listed file removed
- **WHEN** a listed file no longer exists
- **THEN** the test command fails
