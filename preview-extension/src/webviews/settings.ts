import * as vscode from 'vscode';

export class SettingsViewProvider implements vscode.WebviewViewProvider {
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        webviewView.webview.options = {
			enableScripts: true
		};
        const settings = vscode.workspace.getConfiguration("preview.llama");

		webviewView.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Preview llama settings</title>
        </head>
        <body>
            <table>
                <tr>
                    <th>Url</th>
                    <td>${settings.get("url")}</td> 
                </tr>
                <tr>
                    <th>Temperature</th>
                    <td>${settings.get("temp")}</td> 
                </tr>
                <tr>
                    <th>Max tokens</th>
                    <td>${settings.get("maxTokens")}</td> 
                </tr>
            </table>
        </body>
        </html>`;
    }

}
