import * as assert from 'assert';
import {
    findMultipleSpaces,
    findTrailingWhitespace,
    findMixedIndentation,
    findExtraBlankLines,
    findInvisibleWhitespace,
} from '../detectors';

suite('findMultipleSpaces', () => {
    test('does not flag leading indentation', () => {
        const text = '    const x = 1;\n        const y = 2;';
        assert.deepStrictEqual(findMultipleSpaces(text), []);
    });

    test('flags an interior run of 2+ spaces', () => {
        const text = 'const  x = 1;';
        const issues = findMultipleSpaces(text);
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(text.slice(issues[0].start, issues[0].end), '  ');
    });

    test('ignores a trailing run of spaces (owned by trailingWhitespace)', () => {
        const text = 'const x = 1;   ';
        assert.deepStrictEqual(findMultipleSpaces(text), []);
    });

    test('flags interior spaces on an indented line without flagging the indent', () => {
        const text = '    const x  = 1;';
        const issues = findMultipleSpaces(text);
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(text.slice(issues[0].start, issues[0].end), '  ');
    });
});

suite('findTrailingWhitespace', () => {
    test('flags spaces at end of line', () => {
        const text = 'const x = 1;   \nconst y = 2;';
        const issues = findTrailingWhitespace(text);
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(text.slice(issues[0].start, issues[0].end), '   ');
    });

    test('no false positive on a clean line', () => {
        assert.deepStrictEqual(findTrailingWhitespace('const x = 1;'), []);
    });
});

suite('findMixedIndentation', () => {
    test('flags a line indented with a tab then spaces', () => {
        const text = '\t  const x = 1;';
        const issues = findMixedIndentation(text);
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(text.slice(issues[0].start, issues[0].end), '\t  ');
    });

    test('does not flag pure-tab or pure-space indentation', () => {
        assert.deepStrictEqual(findMixedIndentation('\t\tconst x = 1;'), []);
        assert.deepStrictEqual(findMixedIndentation('    const x = 1;'), []);
    });

    test('does not flag a blank line made only of whitespace', () => {
        assert.deepStrictEqual(findMixedIndentation(' \t '), []);
    });
});

suite('findExtraBlankLines', () => {
    test('flags blank lines beyond the configured maximum', () => {
        const text = 'a\n\n\n\nb';
        const issues = findExtraBlankLines(text, 1);
        assert.strictEqual(issues.length, 2);
    });

    test('does not flag a run within the allowed maximum', () => {
        const text = 'a\n\nb';
        assert.deepStrictEqual(findExtraBlankLines(text, 1), []);
    });
});

// Built from numeric code points (not literal characters) so this source file
// contains no actual invisible/non-ASCII bytes.
const NBSP = String.fromCharCode(0x00a0);
const ZERO_WIDTH_NO_BREAK_SPACE = String.fromCharCode(0xfeff);

suite('findInvisibleWhitespace', () => {
    test('flags a non-breaking space', () => {
        const text = `const${NBSP}x = 1;`;
        const issues = findInvisibleWhitespace(text);
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(issues[0].start, text.indexOf(NBSP));
    });

    test('does not flag a BOM at the very start of the file', () => {
        const text = `${ZERO_WIDTH_NO_BREAK_SPACE}const x = 1;`;
        assert.deepStrictEqual(findInvisibleWhitespace(text), []);
    });

    test('flags a zero-width-no-break-space char that is not at position 0', () => {
        const text = `a${ZERO_WIDTH_NO_BREAK_SPACE}b`;
        const issues = findInvisibleWhitespace(text);
        assert.strictEqual(issues.length, 1);
        assert.strictEqual(issues[0].start, 1);
    });
});
