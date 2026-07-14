import * as vscode from 'vscode';
import { DetectorConfig, WhitespaceKind, runDetectors } from './detectors';
import { WhitespaceCodeActionProvider, cleanDocument } from './codeActions';
import { WhitespaceStatusBar } from './statusBar';

const CONFIG_SECTION = 'whitespaceNinja';
const LEGACY_SECTION = 'doubleSpaceHighlighter';
const MIGRATION_FLAG = 'whitespaceNinja.migratedLegacyColor';
const DEBOUNCE_MS = 150;

const ALL_KINDS: WhitespaceKind[] = [
    'multipleSpaces',
    'trailingWhitespace',
    'mixedIndentation',
    'extraBlankLines',
    'invisibleWhitespace',
];

const DEFAULT_COLORS: Record<WhitespaceKind, string> = {
    multipleSpaces: 'rgba(234,0,255,0.3)',
    trailingWhitespace: 'rgba(255,0,0,0.25)',
    mixedIndentation: 'rgba(255,165,0,0.3)',
    extraBlankLines: 'rgba(100,120,255,0.15)',
    invisibleWhitespace: 'rgba(255,215,0,0.35)',
};

let decorationTypes: Partial<Record<WhitespaceKind, vscode.TextEditorDecorationType>> = {};
let statusBar: WhitespaceStatusBar | undefined;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function readDetectorConfig(): DetectorConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return {
        multipleSpaces: config.get('rules.multipleSpaces', true),
        trailingWhitespace: config.get('rules.trailingWhitespace', true),
        mixedIndentation: config.get('rules.mixedIndentation', true),
        extraBlankLines: config.get('rules.extraBlankLines', true),
        invisibleWhitespace: config.get('rules.invisibleWhitespace', true),
        maxBlankLines: config.get('maxBlankLines', 1),
    };
}

function readColor(kind: WhitespaceKind): string {
    return vscode.workspace.getConfiguration(CONFIG_SECTION).get(`colors.${kind}`, DEFAULT_COLORS[kind]);
}

function readMaxFileSizeKB(): number {
    return vscode.workspace.getConfiguration(CONFIG_SECTION).get('maxFileSizeKB', 2000);
}

function disposeDecorations(): void {
    for (const type of Object.values(decorationTypes)) {
        type?.dispose();
    }
    decorationTypes = {};
}

function createDecorations(): void {
    disposeDecorations();
    for (const kind of ALL_KINDS) {
        const color = readColor(kind);
        decorationTypes[kind] = vscode.window.createTextEditorDecorationType({
            backgroundColor: color,
            borderRadius: '2px',
            isWholeLine: kind === 'extraBlankLines',
            overviewRulerColor: color,
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });
    }
}

function updateDecorations(editor: vscode.TextEditor): void {
    const text = editor.document.getText();
    const sizeKB = Buffer.byteLength(text, 'utf8') / 1024;
    if (sizeKB > readMaxFileSizeKB()) {
        for (const kind of ALL_KINDS) {
            const type = decorationTypes[kind];
            if (type) {
                editor.setDecorations(type, []);
            }
        }
        statusBar?.hide();
        return;
    }

    const issues = runDetectors(text, readDetectorConfig());
    const byKind: Record<WhitespaceKind, vscode.DecorationOptions[]> = {
        multipleSpaces: [],
        trailingWhitespace: [],
        mixedIndentation: [],
        extraBlankLines: [],
        invisibleWhitespace: [],
    };

    for (const issue of issues) {
        const range = new vscode.Range(editor.document.positionAt(issue.start), editor.document.positionAt(issue.end));
        byKind[issue.kind].push({ range, hoverMessage: `${issue.message} - Quick Fix available (Ctrl+.)` });
    }

    for (const kind of ALL_KINDS) {
        const type = decorationTypes[kind];
        if (type) {
            editor.setDecorations(type, byKind[kind]);
        }
    }

    statusBar?.update(issues.length);
}

function scheduleUpdate(editor: vscode.TextEditor): void {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => updateDecorations(editor), DEBOUNCE_MS);
}

async function migrateLegacyConfig(context: vscode.ExtensionContext): Promise<void> {
    if (context.globalState.get(MIGRATION_FLAG)) {
        return;
    }

    const legacy = vscode.workspace.getConfiguration(LEGACY_SECTION).inspect<string>('highlightColor');
    const current = vscode.workspace.getConfiguration(CONFIG_SECTION).inspect<string>('colors.multipleSpaces');

    let migrated = false;

    if (legacy?.globalValue !== undefined && current?.globalValue === undefined) {
        await vscode.workspace
            .getConfiguration(CONFIG_SECTION)
            .update('colors.multipleSpaces', legacy.globalValue, vscode.ConfigurationTarget.Global);
        migrated = true;
    }
    if (legacy?.workspaceValue !== undefined && current?.workspaceValue === undefined) {
        await vscode.workspace
            .getConfiguration(CONFIG_SECTION)
            .update('colors.multipleSpaces', legacy.workspaceValue, vscode.ConfigurationTarget.Workspace);
        migrated = true;
    }

    if (migrated) {
        void vscode.window.showInformationMessage(
            'Whitespace Ninja: your custom highlight color was migrated from "doubleSpaceHighlighter.highlightColor" to "whitespaceNinja.colors.multipleSpaces".'
        );
    }

    await context.globalState.update(MIGRATION_FLAG, true);
}

function isCleanable(uri: vscode.Uri): boolean {
    return uri.scheme === 'file' || uri.scheme === 'untitled';
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    await migrateLegacyConfig(context);

    createDecorations();
    statusBar = new WhitespaceStatusBar('whitespaceNinja.cleanFile');

    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(
        statusBar,
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                scheduleUpdate(editor);
            }
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDecorations(editor);
            } else {
                statusBar?.hide();
            }
        }),
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration(CONFIG_SECTION)) {
                createDecorations();
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    updateDecorations(editor);
                }
            }
        }),
        vscode.languages.registerCodeActionsProvider(
            [{ scheme: 'file' }, { scheme: 'untitled' }],
            new WhitespaceCodeActionProvider(readDetectorConfig),
            { providedCodeActionKinds: WhitespaceCodeActionProvider.providedCodeActionKinds }
        ),
        vscode.commands.registerCommand('whitespaceNinja.cleanFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }
            const count = await cleanDocument(editor.document, readDetectorConfig());
            vscode.window.setStatusBarMessage(`Whitespace Ninja: cleaned ${count} issue(s)`, 3000);
        }),
        vscode.commands.registerCommand('whitespaceNinja.cleanWorkspace', async () => {
            let total = 0;
            for (const document of vscode.workspace.textDocuments) {
                if (!isCleanable(document.uri)) {
                    continue;
                }
                total += await cleanDocument(document, readDetectorConfig());
            }
            vscode.window.setStatusBarMessage(`Whitespace Ninja: cleaned ${total} issue(s) across open editors`, 3000);
        })
    );
}

export function deactivate(): void {
    disposeDecorations();
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
}
