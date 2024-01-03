import * as vscode from 'vscode';

export interface PrompResponse {
    response: string;
}

export const llamaRename = async () => {
    const editor = vscode.window.activeTextEditor;
    const llamaSettings = vscode.workspace.getConfiguration("preview.llama");
    if (!llamaSettings.has("url") || !llamaSettings.has("temp") || !llamaSettings.has("maxTokens")) {
        vscode.window.showErrorMessage("Llama settings are not set!");
        return;
    }
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating response...",
        cancellable: true
    }, async (progress, token) => {
        token.onCancellationRequested(() => {
            console.error("User cancelled response");
        });
        progress.report({ increment: 0 });

        if (editor === undefined || editor?.selection === undefined || editor?.selection.isEmpty) {
            vscode.window.showErrorMessage("Preview extension: No text selected!");
            console.error("No text selected:");
            progress.report({ increment: 100 });
            return;
        }
        const text = editor?.document.getText(editor.selection);
        const promptText = `
            [INST]<<SYS>>Suggest a new name for the function. Respond with a function name.<</SYS>>
            [/INST]
            ${text}`;
        progress.report({ increment: 10 });

        const response = await fetch(`${llamaSettings.get("url")}/prompt`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "prompt": promptText,
                "max_tokens": llamaSettings.get("maxTokens"),
                "temp": llamaSettings.get("temp")
            })
        }).catch((error) => {
            vscode.window.showErrorMessage("Preview extension: Failed to fetch response. Check API url settings!");
            console.log(`Fetch failed: ${error}`);
            return undefined;
        });
        if (response === undefined) {
            return;
        }
        const data = await response.json() as PrompResponse;
        const startPos = new vscode.Position(editor.selection.start.line - 1, editor.selection.start.character);
        const endPos = new vscode.Position(editor.selection.start.line - 1, editor.selection.end.character);
        const edit = new vscode.WorkspaceEdit();

        console.log(`Llama response: ${(data as PrompResponse).response}`);
        edit.replace(editor.document.uri, new vscode.Range(startPos, endPos), data.response);
        vscode.workspace.applyEdit(edit);
        progress.report({ increment: 100 });
    });
};
