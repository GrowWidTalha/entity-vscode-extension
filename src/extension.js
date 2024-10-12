"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const entityMap = {
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
function shouldConvert(char, prevChar, nextChar) {
    return char in entityMap;
}
function convertCharacter(document, position) {
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
function activate(context) {
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
function deactivate() { }
//# sourceMappingURL=extension.js.map