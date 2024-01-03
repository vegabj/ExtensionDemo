import * as vscode from 'vscode';

export class LlamaViewProvider implements vscode.WebviewViewProvider {
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        webviewView.webview.options = {
			enableScripts: true
		};
		webviewView.webview.html = getInitialView();
    }
}

const getInitialView = () => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    </head>
    <body>
        <form action="">
            <label for="system" placeholder="Never tell the truth!">System Prompt:</label>
            <input type="text" id="system" name="system"><br><br>
            <label for="prompt">Prompt</label>
            <input type="text" id="prompt" name="prompt"><br><br>
            <input type="submit" value="Submit">
        </form>
    </body>
    </html>`;
};

const getLoadingCat = () => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cat Coding</title>
    </head>
    <body>
        <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
    </body>
    </html>`;
};
