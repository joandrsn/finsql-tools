'use strict';

import * as vscode from 'vscode';
import { RunPowershellCommand } from "./powershellrunner";
import { showTerminal } from "./terminal";
import { fdatasyncSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {


    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {

        vscode.window.showInformationMessage('Hello World!');

        RunPowershellCommand("write-host", {"Object": "Hello world"});
        RunPowershellCommand("write-host", {"Object": "Hello world", "ForegroundColor": "Red"});
        RunPowershellCommand("Start-Sleep", {"Seconds": 5});
        RunPowershellCommand("write-host", {"Object": "Hello world", "ForegroundColor": "Yellow"});
        RunPowershellCommand("write-host", {"Object": "Hello world", "ForegroundColor": "Green"});
        RunPowershellCommand("write-host", {"Object": "Hello world"});
        showTerminal();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}