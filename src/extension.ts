import * as vscode from 'vscode';

let decorationType: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {

    function updateDecorations(editor: vscode.TextEditor) {
        if (!editor) {
            return;
        }

        const text = editor.document.getText();
        const regex = / {2,}/g;
        const ranges: vscode.DecorationOptions[] = [];

        let match: RegExpExecArray | null;
        while ((match = regex.exec(text))) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);

            ranges.push({
                range: new vscode.Range(startPos, endPos)
            });
        }

        editor.setDecorations(decorationType!, ranges);
    }

    function createDecoration() {
        // Dispose old decoration to prevent memory leak
        if (decorationType) {
            decorationType.dispose();
        }

        const config = vscode.workspace.getConfiguration('doubleSpaceHighlighter');
        const color = config.get<string>('highlightColor', 'rgba(255,0,0,0.3)');

        decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: color,
            borderRadius: '2px'
        });
    }

    createDecoration();

    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                updateDecorations(editor);
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDecorations(editor);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('doubleSpaceHighlighter')) {
                createDecoration();
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    updateDecorations(editor);
                }
            }
        })
    );
}

export function deactivate() {
    if (decorationType) {
        decorationType.dispose();
    }
}
