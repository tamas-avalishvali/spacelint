# Whitespace Ninja

[![Version](https://img.shields.io/visual-studio-marketplace/v/QuickTools.whitespace-ninja)](https://marketplace.visualstudio.com/items?itemName=QuickTools.whitespace-ninja)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/QuickTools.whitespace-ninja)](https://marketplace.visualstudio.com/items?itemName=QuickTools.whitespace-ninja)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/QuickTools.whitespace-ninja)](https://marketplace.visualstudio.com/items?itemName=QuickTools.whitespace-ninja)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Real-time whitespace hygiene for any file — double spaces, trailing whitespace,
mixed tabs/spaces, extra blank lines, and invisible unicode whitespace, each
highlighted as you type with a one-click Quick Fix.

## Why

Whitespace bugs are invisible until they aren't: a stray non-breaking space
pasted from a web page that breaks your build, trailing spaces that show up as
noise in every diff, tabs and spaces mixed in one line that render differently
per editor. Whitespace Ninja surfaces all of it live, without ever flagging
your normal indentation.

## Features

- **Multiple spaces** — flags 2+ spaces in the middle of a line. Leading
  indentation is never flagged, no matter how many spaces or tabs your project
  uses.
- **Trailing whitespace** — spaces/tabs left at the end of a line.
- **Mixed indentation** — a line whose leading whitespace mixes tabs and
  spaces.
- **Extra blank lines** — more than N consecutive blank lines (configurable).
- **Invisible whitespace** — non-breaking spaces and other unicode whitespace
  characters that look like a normal space but aren't.
- **Quick Fix** — `Ctrl+.` / `Cmd+.` on any highlighted issue to fix it in
  place.
- **Clean commands** — `Whitespace Ninja: Clean Current File` and
  `Whitespace Ninja: Clean All Open Files` fix everything in one pass.
- **Status bar counter** — live issue count for the active file; click it to
  clean the file.
- Each rule has its own color and can be toggled off independently.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `whitespaceNinja.rules.multipleSpaces` | `true` | Highlight interior multi-space runs. |
| `whitespaceNinja.rules.trailingWhitespace` | `true` | Highlight trailing whitespace. |
| `whitespaceNinja.rules.mixedIndentation` | `true` | Highlight mixed tab/space indentation. |
| `whitespaceNinja.rules.extraBlankLines` | `true` | Highlight excess consecutive blank lines. |
| `whitespaceNinja.rules.invisibleWhitespace` | `true` | Highlight invisible unicode whitespace. |
| `whitespaceNinja.maxBlankLines` | `1` | Max consecutive blank lines allowed before flagging. |
| `whitespaceNinja.maxFileSizeKB` | `2000` | Skip scanning files above this size. |
| `whitespaceNinja.colors.*` | see below | Per-rule highlight color (`multipleSpaces`, `trailingWhitespace`, `mixedIndentation`, `extraBlankLines`, `invisibleWhitespace`). |

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
