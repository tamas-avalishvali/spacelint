/**
 * Pure text-analysis functions. No `vscode` dependency so these can be unit
 * tested directly and reused by both the live decorator and the quick-fix
 * code actions.
 */

export type WhitespaceKind =
  | 'multipleSpaces'
  | 'trailingWhitespace'
  | 'mixedIndentation'
  | 'extraBlankLines'
  | 'invisibleWhitespace';

export interface WhitespaceIssue {
  start: number;
  end: number;
  kind: WhitespaceKind;
  message: string;
}

export interface DetectorConfig {
  multipleSpaces: boolean;
  trailingWhitespace: boolean;
  mixedIndentation: boolean;
  extraBlankLines: boolean;
  invisibleWhitespace: boolean;
  maxBlankLines: number;
}

export const DEFAULT_DETECTOR_CONFIG: DetectorConfig = {
  multipleSpaces: true,
  trailingWhitespace: true,
  mixedIndentation: true,
  extraBlankLines: true,
  invisibleWhitespace: true,
  maxBlankLines: 1,
};

interface Line {
  text: string;
  start: number;
}

function splitLines(text: string): Line[] {
  const lines: Line[] = [];
  let start = 0;
  for (let i = 0; i <= text.length; i++) {
    if (i === text.length || text[i] === '\n') {
      let end = i;
      if (end > start && text[end - 1] === '\r') {
        end -= 1;
      }
      lines.push({ text: text.slice(start, end), start });
      start = i + 1;
    }
  }
  return lines;
}

/** Runs of 2+ literal spaces, excluding leading indentation and trailing whitespace. */
export function findMultipleSpaces(text: string): WhitespaceIssue[] {
  const issues: WhitespaceIssue[] = [];
  for (const line of splitLines(text)) {
    const leadingMatch = /^[ \t]*/.exec(line.text);
    const leadingLen = leadingMatch ? leadingMatch[0].length : 0;
    const trailingMatch = /[ \t]*$/.exec(line.text);
    const trailingLen = trailingMatch ? trailingMatch[0].length : 0;
    const interiorEnd = Math.max(leadingLen, line.text.length - trailingLen);

    const interior = line.text.slice(leadingLen, interiorEnd);
    const regex = / {2,}/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(interior))) {
      const from = line.start + leadingLen + match.index;
      issues.push({
        start: from,
        end: from + match[0].length,
        kind: 'multipleSpaces',
        message: 'Multiple spaces - did you mean a single space?',
      });
    }
  }
  return issues;
}

/** Spaces/tabs at the end of a line. */
export function findTrailingWhitespace(text: string): WhitespaceIssue[] {
  const issues: WhitespaceIssue[] = [];
  for (const line of splitLines(text)) {
    const match = /[ \t]+$/.exec(line.text);
    if (match) {
      const from = line.start + match.index;
      issues.push({
        start: from,
        end: from + match[0].length,
        kind: 'trailingWhitespace',
        message: 'Trailing whitespace',
      });
    }
  }
  return issues;
}

/** Leading indentation that mixes tabs and spaces on the same line. */
export function findMixedIndentation(text: string): WhitespaceIssue[] {
  const issues: WhitespaceIssue[] = [];
  for (const line of splitLines(text)) {
    if (line.text.trim() === '') {
      continue;
    }
    const leadingMatch = /^[ \t]+/.exec(line.text);
    if (!leadingMatch) {
      continue;
    }
    const leading = leadingMatch[0];
    if (leading.includes(' ') && leading.includes('\t')) {
      issues.push({
        start: line.start,
        end: line.start + leading.length,
        kind: 'mixedIndentation',
        message: 'Mixed tabs and spaces in indentation',
      });
    }
  }
  return issues;
}

/** Runs of more than `maxBlankLines` consecutive blank lines. */
export function findExtraBlankLines(
  text: string,
  maxBlankLines: number,
): WhitespaceIssue[] {
  const issues: WhitespaceIssue[] = [];
  const lines = splitLines(text);
  let runStart = -1;
  let runLength = 0;

  const flushRun = (endIndex: number) => {
    if (runLength > maxBlankLines) {
      for (let i = runStart + maxBlankLines; i < endIndex; i++) {
        const line = lines[i];
        issues.push({
          start: line.start,
          end: line.start,
          kind: 'extraBlankLines',
          message: `More than ${maxBlankLines} consecutive blank line(s)`,
        });
      }
    }
    runStart = -1;
    runLength = 0;
  };

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].text.trim() === '') {
      if (runLength === 0) {
        runStart = i;
      }
      runLength++;
    } else {
      flushRun(i);
    }
  }
  flushRun(lines.length);

  return issues;
}

// Unicode code points that render as blank but are not a plain ASCII space:
// non-breaking space, ogham space mark, the general-punctuation space family,
// line/paragraph separators, narrow/medium spaces, ideographic space,
// zero-width space/non-joiner/joiner, word joiner, and zero-width no-break
// space (BOM). Kept as numeric code points rather than literal characters so
// this source file contains no actual invisible/non-ASCII bytes.
const INVISIBLE_WHITESPACE_CODEPOINTS = [
  0x00a0, 0x1680, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
  0x2007, 0x2008, 0x2009, 0x200a, 0x2028, 0x2029, 0x202f, 0x205f, 0x3000,
  0x200b, 0x200c, 0x200d, 0x2060, 0xfeff,
];

const BOM_CODEPOINT = 0xfeff;

function buildInvisibleWhitespaceRegex(): RegExp {
  const charClass = INVISIBLE_WHITESPACE_CODEPOINTS.map(
    (cp) => `\\u${cp.toString(16).padStart(4, '0')}`,
  ).join('');
  return new RegExp(`[${charClass}]`, 'g');
}

/** Non-breaking / zero-width / other unicode whitespace that looks like a regular space but isn't. */
export function findInvisibleWhitespace(text: string): WhitespaceIssue[] {
  const issues: WhitespaceIssue[] = [];
  const regex = buildInvisibleWhitespaceRegex();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    if (match.index === 0 && match[0].codePointAt(0) === BOM_CODEPOINT) {
      continue; // legitimate BOM at file start
    }
    issues.push({
      start: match.index,
      end: match.index + match[0].length,
      kind: 'invisibleWhitespace',
      message: 'Invisible or non-breaking whitespace character',
    });
  }
  return issues;
}

export function runDetectors(
  text: string,
  config: DetectorConfig,
): WhitespaceIssue[] {
  const issues: WhitespaceIssue[] = [];
  if (config.multipleSpaces) {
    issues.push(...findMultipleSpaces(text));
  }
  if (config.trailingWhitespace) {
    issues.push(...findTrailingWhitespace(text));
  }
  if (config.mixedIndentation) {
    issues.push(...findMixedIndentation(text));
  }
  if (config.extraBlankLines) {
    issues.push(...findExtraBlankLines(text, config.maxBlankLines));
  }
  if (config.invisibleWhitespace) {
    issues.push(...findInvisibleWhitespace(text));
  }
  return issues;
}
