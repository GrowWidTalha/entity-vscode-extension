import * as vscode from 'vscode';

const entityMap: Record<string, string> = {
  "'": '&apos;',
  '"': '&quot;',
  '&': '&amp;',
  '¢': '&cent;',
  '£': '&pound;',
  '¥': '&yen;',
  '€': '&euro;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
};

let isEnabled = true;
let statusBarItem: vscode.StatusBarItem;
let disposables: vscode.Disposable[] = [];

function shouldConvert(char: string): boolean {
  return char in entityMap;
}

function convertCharacter(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !isEnabled) {
    return;
  }

  const range = new vscode.Range(position.translate(0, -1), position);
  const text = document.getText(range);

  if (text.length === 1 && shouldConvert(text)) {
    const converted = entityMap[text];
    editor.edit(editBuilder => {
      editBuilder.replace(range, converted);
    }).then(success => {
      if (success) {
        const newPosition = position.translate(0, converted.length - 1);
        editor.selection = new vscode.Selection(newPosition, newPosition);
      }
    });
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('HTML Entity Converter is now active!');

  let textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
    const { document, contentChanges } = event;

    if (document.languageId === 'html' || document.languageId === 'javascriptreact' || document.languageId === 'typescriptreact') {
      for (const change of contentChanges) {
        if (change.text.length === 1) {
          convertCharacter(document, change.range.end);
        }
      }
    }
  });

  disposables.push(textChangeDisposable);

  // Register enable command
  let enableDisposable = vscode.commands.registerCommand('htmlEntityConverter.enable', () => {
    isEnabled = true;
    updateStatusBarItem();
    vscode.window.showInformationMessage('HTML Entity Converter is now enabled');
  });
  disposables.push(enableDisposable);

  // Register disable command
  let disableDisposable = vscode.commands.registerCommand('htmlEntityConverter.disable', () => {
    isEnabled = false;
    updateStatusBarItem();
    vscode.window.showInformationMessage('HTML Entity Converter is now disabled');
  });
  disposables.push(disableDisposable);

  // Register status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'htmlEntityConverter.toggle';
  updateStatusBarItem();
  statusBarItem.show();
  disposables.push(statusBarItem);

  // Register toggle command
  let toggleDisposable = vscode.commands.registerCommand('htmlEntityConverter.toggle', () => {
    isEnabled = !isEnabled;
    updateStatusBarItem();
    vscode.window.showInformationMessage(`HTML Entity Converter is now ${isEnabled ? 'enabled' : 'disabled'}`);
  });
  disposables.push(toggleDisposable);

  context.subscriptions.push(...disposables);
}

function updateStatusBarItem() {
  statusBarItem.text = isEnabled ? "HTML Entity: ON" : "HTML Entity: OFF";
}

export function deactivate() {
  // Dispose of all disposables
  disposables.forEach(disposable => disposable.dispose());
  disposables = [];

  // Clear the status bar item
  if (statusBarItem) {
    statusBarItem.dispose();
  }

  console.log('HTML Entity Converter has been deactivated.');
}
