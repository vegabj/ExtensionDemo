import * as vscode from 'vscode';

export const simpleMessage = () => {
    vscode.window.showInformationMessage("Hello world!");
};


export const simpleSelectedMessage = () => {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined || editor?.selection === undefined || editor?.selection.isEmpty) {
        vscode.window.showErrorMessage("Preview extension: No text selected!");
        return;
    }
    const text = editor?.document.getText(editor.selection);
    vscode.window.showWarningMessage(`You have selected the text: ${text}`);
};

export const simpleTimer = () => {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating response...",
        cancellable: true
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            vscode.window.showErrorMessage("Preview extension: Operation cancelled by user!", );
        });

        progress.report({ increment: 0 });

			setTimeout(() => {
				progress.report({ increment: 10, message: "I am long running! - still going..." });
			}, 1000);

			setTimeout(() => {
				progress.report({ increment: 40, message: "I am long running! - still going even more..." });
			}, 2000);

			setTimeout(() => {
				progress.report({ increment: 50, message: "I am long running! - almost there..." });
			}, 3000);

			const p = new Promise<void>(resolve => {
				setTimeout(() => {
					resolve();
				}, 5000);
			});

			return p;
    });
};
