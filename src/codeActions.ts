import * as vscode from 'vscode';
import { DetectorConfig, WhitespaceIssue, runDetectors } from './detectors';

const KIND_LABEL: Record<WhitespaceIssue['kind'], string> = {
    multipleSpaces: 'Collapse to a single space',
    trailingWhitespace: 'Remove trailing whitespace',
    mixedIndentation: 'Normalize mixed indentation to spaces',
    extraBlankLines: 'Remove extra blank line',
    invisibleWhitespace: 'Replace with a regular space',
};

function replacementFor(issue: WhitespaceIssue, document: vscode.TextDocument): string {
    switch (issue.kind) {
        case 'multipleSpaces':
        case 'invisibleWhitespace':
            return ' ';
        case 'trailingWhitespace':
            return '';
        case 'mixedIndentation': {
            const range = new vscode.Range(document.positionAt(issue.start), document.positionAt(issue.end));
            const tabSize = vscode.window.activeTextEditor?.options.tabSize ?? 4;
            const width = typeof tabSize === 'number' ? tabSize : 4;
            return ' '.repeat(document.getText(range).length * width);
        }
        case 'extraBlankLines':
            return '';
    }
}

export class WhitespaceCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    constructor(private readonly getConfig: () => DetectorConfig) {}

    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction[] {
        const issues = runDetectors(document.getText(), this.getConfig());
        const actions: vscode.CodeAction[] = [];

        for (const issue of issues) {
            const issueRange = new vscode.Range(document.positionAt(issue.start), document.positionAt(issue.end));
            if (!issueRange.intersection(range) && !issueRange.contains(range)) {
                continue;
            }

            const action = new vscode.CodeAction(KIND_LABEL[issue.kind], vscode.CodeActionKind.QuickFix);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri, issueRange, replacementFor(issue, document));
            action.edit = edit;
            action.isPreferred = true;
            actions.push(action);
        }

        return actions;
    }
}

/** Applies every fix in a single WorkspaceEdit so undo restores the whole file in one step. */
export async function cleanDocument(document: vscode.TextDocument, config: DetectorConfig): Promise<number> {
    const issues = runDetectors(document.getText(), config);
    if (issues.length === 0) {
        return 0;
    }

    const edit = new vscode.WorkspaceEdit();
    for (const issue of issues) {
        const issueRange = new vscode.Range(document.positionAt(issue.start), document.positionAt(issue.end));
        edit.replace(document.uri, issueRange, replacementFor(issue, document));
    }
    await vscode.workspace.applyEdit(edit);
    return issues.length;
}
