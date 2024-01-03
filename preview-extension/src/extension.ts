// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SettingsViewProvider } from './webviews/settings';
import { llamaRename } from './llamapilot';
import { simpleMessage, simpleSelectedMessage, simpleTimer } from './simple';
import { editExtensionSettings } from './editSettings';
import { LlamaViewProvider } from './webviews/llama';
import { sdxlPrompt } from './sdxl';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('"preview-extension" is now active!');
	// The commandId parameter must match the command field in package.json
	
	const simpleMessageCommand = vscode.commands.registerCommand('preview.simple.message', simpleMessage);
	const simpleSelectedMessageCommand = vscode.commands.registerCommand('preview.simple.selected', simpleSelectedMessage);
	const simpleTimerCommand = vscode.commands.registerCommand('preview.simple.timer', simpleTimer);
	const quickPickCommand = vscode.commands.registerCommand('preview.simple.quickpick', editExtensionSettings);
	
	const provider = new SettingsViewProvider();
	const settingsViewProvider = vscode.window.registerWebviewViewProvider("preview.view.settings", provider);
	const llamaProvider = new LlamaViewProvider();
	const llamaViewProvider = vscode.window.registerWebviewViewProvider("preview.view.promptLlama", llamaProvider);

	const llamaRenameCommand = vscode.commands.registerCommand('preview.refactor.autorename', llamaRename);
	const sdxlCommand = vscode.commands.registerCommand('preview.sdxl.prompt', sdxlPrompt);

	context.subscriptions.push(simpleMessageCommand);
	context.subscriptions.push(simpleSelectedMessageCommand);
	context.subscriptions.push(simpleTimerCommand);
	context.subscriptions.push(quickPickCommand);
	context.subscriptions.push(llamaRenameCommand);
	context.subscriptions.push(settingsViewProvider);
	context.subscriptions.push(llamaViewProvider);
	context.subscriptions.push(sdxlCommand);
}

// This method is called when your extension is deactivated
export function deactivate() { }
