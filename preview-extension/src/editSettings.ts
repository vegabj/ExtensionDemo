import * as vscode from 'vscode';


export const editExtensionSettings = async (context: vscode.ExtensionContext) => {
    const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
        editTemperature,
        editUrl
    };
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = Object.keys(options).map(label => ({ label }));
    quickPick.onDidChangeSelection(selection => {
        if (selection[0]) {
            options[selection[0].label](context)
                .catch(console.error);
        }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
};

const editTemperature = async () => {
    let i = 0;
    const result = await vscode.window.showQuickPick(['0.1', '0.2', '0.3', '0.5', '0.7'], {
        placeHolder: 'Select appropriate llama temperature',
        onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
    });
    vscode.window.showInformationMessage(`Got: ${result}`);
    const config = vscode.workspace.getConfiguration("preview.llama");
    if (result) {
        await config.update("temp", result);
    }
};

const editUrl = async () => {
    const config = vscode.workspace.getConfiguration("preview.llama");
    const result = await vscode.window.showInputBox({
        value: config.get("url"),
        valueSelection: [7, 16],
        placeHolder: 'Set an appropriate URL',
        validateInput: text => {
            vscode.window.showInformationMessage(`Validating: ${text}`);
            try {
                const url = new URL(text);
                return null;
            }
            catch {
                return text;
            }
        }
    });
    if (result) {
        vscode.window.showInformationMessage(`Setting: ${result} as llama url`);
        if (result) {
            await config.update("url", result);
        }
    }
};
