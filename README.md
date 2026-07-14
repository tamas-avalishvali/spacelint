# Whitespace Ninja — Whitespace Linter & Formatter for VS Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/QuickTools.whitespace-ninja)](https://marketplace.visualstudio.com/items?itemName=QuickTools.whitespace-ninja)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/QuickTools.whitespace-ninja)](https://marketplace.visualstudio.com/items?itemName=QuickTools.whitespace-ninja)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/QuickTools.whitespace-ninja)](https://marketplace.visualstudio.com/items?itemName=QuickTools.whitespace-ninja)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Real-time whitespace linter and formatter for any file — catches **trailing
whitespace**, **double spaces**, **mixed tabs/spaces indentation**, **extra
blank lines**, and **invisible unicode whitespace** (non-breaking spaces and
similar characters), each highlighted live as you type with a one-click
Quick Fix.

<!-- TODO: add demo GIF here showing live highlighting + Quick Fix -->

## Why whitespace hygiene matters

Whitespace bugs are invisible until they aren't: a stray non-breaking space
pasted from a web page that breaks your build, trailing whitespace that shows
up as noise in every diff, tabs and spaces mixed on one line that render
differently per editor, or a run of blank lines that quietly grows in a long
file. Whitespace Ninja surfaces all of it live, without ever flagging your
normal leading indentation.

## Features: trailing whitespace, double spaces, mixed indentation & more

- **Double spaces** — flags 2+ spaces in the middle of a line. Leading
  indentation is never flagged, no matter how many spaces or tabs your
  project uses.
- **Trailing whitespace** — spaces/tabs left at the end of a line.
- **Mixed indentation** — a line whose leading whitespace mixes tabs and
  spaces.
- **Extra blank lines** — more than N consecutive blank lines (configurable
  max).
- **Invisible / unicode whitespace** — non-breaking spaces and other unicode
  whitespace characters that look like a normal space but aren't.
- **Quick Fix** — `Ctrl+.` / `Cmd+.` on any highlighted issue to fix it in
  place.
- **Clean commands** — `Whitespace Ninja: Clean Current File` and
  `Whitespace Ninja: Clean All Open Files` fix everything in one pass.
- **Status bar issue counter** — live issue count for the active file; click
  it to clean the file.
- **Per-rule toggle & color** — turn any rule off, or give it its own
  highlight color.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `whitespaceNinja.rules.multipleSpaces` | `true` | Highlight interior multi-space (double space) runs. |
| `whitespaceNinja.rules.trailingWhitespace` | `true` | Highlight trailing whitespace. |
| `whitespaceNinja.rules.mixedIndentation` | `true` | Highlight mixed tab/space indentation. |
| `whitespaceNinja.rules.extraBlankLines` | `true` | Highlight excess consecutive blank lines. |
| `whitespaceNinja.rules.invisibleWhitespace` | `true` | Highlight invisible unicode whitespace. |
| `whitespaceNinja.maxBlankLines` | `1` | Max consecutive blank lines allowed before flagging. |
| `whitespaceNinja.maxFileSizeKB` | `2000` | Skip scanning files above this size (KB), to keep typing responsive. |
| `whitespaceNinja.colors.multipleSpaces` | `rgba(234,0,255,0.3)` | Highlight color for double-space issues. |
| `whitespaceNinja.colors.trailingWhitespace` | `rgba(255,0,0,0.25)` | Highlight color for trailing-whitespace issues. |
| `whitespaceNinja.colors.mixedIndentation` | `rgba(255,165,0,0.3)` | Highlight color for mixed-indentation issues. |
| `whitespaceNinja.colors.extraBlankLines` | `rgba(100,120,255,0.15)` | Highlight color for extra-blank-line issues. |
| `whitespaceNinja.colors.invisibleWhitespace` | `rgba(255,215,0,0.35)` | Highlight color for invisible/unicode whitespace issues. |

> Upgrading from an earlier version? Your `doubleSpaceHighlighter.highlightColor`
> setting is migrated automatically to `whitespaceNinja.colors.multipleSpaces`
> the first time you open the new version.

## Commands

- `Whitespace Ninja: Clean Current File`
- `Whitespace Ninja: Clean All Open Files`

## Installation

1. Open the Extensions view in VS Code (`Ctrl+Shift+X`).
2. Search for **Whitespace Ninja**.
3. Click Install.

Or install from a local `.vsix`: Extensions view → `...` menu → **Install from VSIX**.

## License

[MIT](LICENSE)