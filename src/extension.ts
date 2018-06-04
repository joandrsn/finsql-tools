'use strict';

import { ExtensionContext, commands } from 'vscode';
import * as action from './actions'

export function activate(context: ExtensionContext) {
    action.initialize();
    let subs = context.subscriptions;

    subs.push(commands.registerCommand('dynamicsnavscm.relaunchterminal', action.relaunchTerminal));
    subs.push(commands.registerCommand('dynamicsnavscm.generateNAVFolderStructure', action.generateNAVFolderStructure));
    subs.push(commands.registerCommand('dynamicsnavscm.exportfromnav', action.exportSplitObjects))
    subs.push(commands.registerCommand('dynamicsnavscm.importtonav', action.ImportObjects));
    subs.push(commands.registerCommand('dynamicsnavscm.startIDE', action.startNAVIDE));
}

export function deactivate() {
}