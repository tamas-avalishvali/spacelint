import * as vscode from 'vscode';

export class WhitespaceStatusBar {
    private readonly item: vscode.StatusBarItem;

    constructor(cleanFileCommand: string) {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.item.command = cleanFileCommand;
    }

    public update(issueCount: number): void {
        if (issueCount === 0) {
            this.item.text = '$(check) Whitespace';
            this.item.tooltip = 'Whitespace Ninja: no issues found in this file';
        } else {
            this.item.text = `$(warning) Whitespace: ${issueCount}`;
            this.item.tooltip = `Whitespace Ninja: ${issueCount} issue(s) found - click to clean this file`;
        }
        this.item.show();
    }

    public hide(): void {
        this.item.hide();
    }

    public dispose(): void {
        this.item.dispose();
    }
}
