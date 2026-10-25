# Spec Delta

## MODIFIED Requirements

### Requirement: Relative URLs only
The published pages, stylesheets, app manifest and offline file list SHALL refer to the site's own files with relative URLs only, so the site works both at a domain root and under a subpath.

#### Scenario: Served under a subpath
- **WHEN** the site is served under a subpath instead of a domain root
- **THEN** every file the pages refer to still loads

#### Scenario: Absolute URL introduced
- **WHEN** a page, stylesheet, the manifest or the offline file list refers to a file with a root-relative or absolute URL
- **THEN** the test command fails
