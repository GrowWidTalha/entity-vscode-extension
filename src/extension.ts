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

// Detect if a character should be converted to an entity
function shouldConvert(char: string, prevChar: string, nextChar: string): boolean {
  return char in entityMap;
}

function convertCharacter(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const range = new vscode.Range(position.translate(0, -1), position);
  const text = document.getText(range);

  if (text.length === 1) {
    const prevChar = position.character > 1 ? document.getText(new vscode.Range(position.translate(0, -2), position.translate(0, -1))) : '';
    const nextChar = document.getText(new vscode.Range(position, position.translate(0, 1)));

    if (shouldConvert(text, prevChar, nextChar)) {
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
}

export function activate(context: vscode.ExtensionContext) {
  console.log('HTML Entity Converter is now active!');

  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    const { document, contentChanges } = event;

    if (document.languageId === 'html' || document.languageId === 'javascriptreact') {
      for (const change of contentChanges) {
        if (change.text.length === 1) {
          convertCharacter(document, change.range.end);
        }
      }
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
