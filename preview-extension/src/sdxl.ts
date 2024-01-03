import * as vscode from 'vscode';

export interface SDXLResponse {
    path: string;
}

export const sdxlPrompt = async () => {
    const config = vscode.workspace.getConfiguration("preview.llama");
    const prompt = await vscode.window.showInputBox({
        value: "A majestic cat reading a book",
        placeHolder: "A majestic italian greyhound jumping from a rock at night"
    });
    if (prompt === undefined) {
        return;
    }

    // Super cool fake progress bar.
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Generating an image of ${prompt}...`,
        cancellable: true
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            vscode.window.showErrorMessage("Preview: SDXL prompt cancelled by user!", );
        });
        progress.report({ increment: 0 });
        setInterval(() => {
            progress.report({ increment: 5, message: "This is a fake progress bar :)" });
        }, 7000);

        return new Promise<void>(resolve => {
            setTimeout(() => {
                resolve();
            }, 140000);
        });
    });

    const response = await fetch(`${config.get("url")}/generate2`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "prompt": prompt,
            "steps": 40,
            "denoising_fraction": 0.8
        })
    }).catch((error) => {
        vscode.window.showErrorMessage("Preview extension: Failed to fetch response. Check API url settings!");
        console.log(`Fetch failed: ${error}`);
        return undefined;
    });

    if (response === undefined) { return; }
    const content = await response.json() as SDXLResponse;
    await vscode.env.openExternal(vscode.Uri.parse(content.path));

    // TODO:
    // const blobResponse = await response.blob();
    // const url = URL.createObjectURL(blobResponse);
};
