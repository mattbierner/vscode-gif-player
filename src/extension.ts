import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const provider = new GifPlayerProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(GifPlayerProvider.id, provider, {
			supportsMultipleEditorsPerDocument: true
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('gifPlayer.togglePlay', () => {
			provider.togglePlaying();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('gifPlayer.nextFrame', () => {
			provider.nextFrame();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('gifPlayer.previousFrame', () => {
			provider.previousFrame();
		}));
}


class GifDocument implements vscode.CustomDocument {
	constructor(
		public readonly uri: vscode.Uri
	) { }

	dispose() {
		// noop
	}
}

class GifPlayerProvider implements vscode.CustomReadonlyEditorProvider {

	public static readonly id = 'gifPlayer.player';

	private static readonly context = 'gifPlayerActive';

	constructor(
		private readonly extensionUri: vscode.Uri,
	) { }

	private _activeWebviewPanel: vscode.WebviewPanel | undefined;

	private set activeWebviewPanel(value: vscode.WebviewPanel | undefined) {
		this._activeWebviewPanel = value;
		vscode.commands.executeCommand('setContext', GifPlayerProvider.context, !!value);
	}

	private get activeWebview(): vscode.Webview | undefined {
		return this._activeWebviewPanel?.webview;
	}

	openCustomDocument(
		uri: vscode.Uri,
		_openContext: vscode.CustomDocumentOpenContext,
		_token: vscode.CancellationToken
	): vscode.CustomDocument | Promise<vscode.CustomDocument> {
		return new GifDocument(uri);
	}

	resolveCustomEditor(
		document: vscode.CustomDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken,
	): void {
		const nonce = Date.now() + '';

		const scriptSrc = webviewPanel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionUri, 'preview', 'out', 'index.js'));

		const styleSrc = webviewPanel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionUri, 'preview-media', 'main.css'));

		const codiconsSrc = webviewPanel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.extensionUri, 'preview-media', 'codicon.ttf'));

		webviewPanel.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this.extensionUri, 'preview-media'),
				vscode.Uri.joinPath(this.extensionUri, 'preview', 'out'),
				document.uri.with({ path: path.dirname(document.uri.path) }),
			]
		};

		webviewPanel.onDidChangeViewState(() => {
			if (this._activeWebviewPanel === webviewPanel) {
				if (!webviewPanel.active) {
					this.activeWebviewPanel = undefined;
				}
			} else {
				if (webviewPanel.active) {
					this.activeWebviewPanel = webviewPanel;
				}
			}
		});

		webviewPanel.onDidDispose(() => {
			if (this._activeWebviewPanel === webviewPanel) {
				this.activeWebviewPanel = undefined;
			}
		});

		this.activeWebviewPanel = webviewPanel;

		const configuration = {
			autoPlay: vscode.workspace.getConfiguration('gifPlayer', document.uri).get('autoPlay', true)
		};

		webviewPanel.webview.html = /* html */`<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Gif Player</title>
				
				<style>
				@font-face {
					font-family: "codicon";
					src: url(${codiconsSrc}) format("truetype");
				}

				.codicon {
					font: normal normal normal 16px/1 codicon;
					display: inline-block;
					text-decoration: none;
					text-rendering: auto;
					text-align: center;
					-webkit-font-smoothing: antialiased;
					-moz-osx-font-smoothing: grayscale;
					user-select: none;
					-webkit-user-select: none;
					-ms-user-select: none;
				}
				</style>

				<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src 'nonce-${nonce}';
					style-src ${webviewPanel.webview.cspSource};
					img-src ${webviewPanel.webview.cspSource};
					font-src ${webviewPanel.webview.cspSource};
					connect-src ${webviewPanel.webview.cspSource};">

				<link rel="stylesheet" href="${styleSrc}">

				<meta id='data'
					data-uri='${webviewPanel.webview.asWebviewUri(document.uri).toString()}'
					data-configuration='${JSON.stringify(configuration)}'>
			</head> 
			<body>
				<script src="${scriptSrc}" nonce="${nonce}"></script>
			</body>
			</html>`;
		return;
	}

	togglePlaying() {
		this.activeWebview?.postMessage({ type: 'togglePlaying' });
	}

	nextFrame() {
		this.activeWebview?.postMessage({ type: 'nextFrame' });
	}

	previousFrame() {
		this.activeWebview?.postMessage({ type: 'previousFrame' });
	}
}