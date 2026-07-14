# Change Log

All notable changes to the "whitespace-ninja" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.2.0]

- Fixed: multi-space detection no longer flags leading indentation (the main
  source of false positives).
- Added: trailing whitespace, mixed tab/space indentation, extra blank line,
  and invisible/unicode whitespace detection rules, each independently
  toggleable with its own color.
- Added: Quick Fix (`Ctrl+.`) for every detected issue.
- Added: `Whitespace Ninja: Clean Current File` and `Whitespace Ninja: Clean
  All Open Files` commands.
- Added: status bar issue counter for the active file.
- Added: debounced re-scan and a configurable file-size cap to keep large
  files responsive.
- Changed: settings/commands moved from `doubleSpaceHighlighter.*` to
  `whitespaceNinja.*`; existing `doubleSpaceHighlighter.highlightColor` values
  are migrated automatically.

## [0.0.7]

- Initial release: real-time double-space highlighting.