'use strict';

import { ExtensionContext, commands } from 'vscode';
import * as action from './actions'

export function activate(context: ExtensionContext) {
    action.initialize();
    let subs = context.subscriptions;

    subs.push(commands.registerCommand('finsqltools.relaunchterminal', action.relaunchTerminal));
    subs.push(commands.registerCommand('finsqltools.generateNAVFolderStructure', action.generateNAVFolderStructure));
    subs.push(commands.registerCommand('finsqltools.exportallfromnav', action.exportAllFromNAV));
    subs.push(commands.registerCommand('finsqltools.exportfiltersfromnav', action.exportFiltersFromNAV));
    subs.push(commands.registerCommand('finsqltools.importtonav', action.ImportObjects));
    subs.push(commands.registerCommand('finsqltools.startIDE', action.startNAVIDE));
}

export function deactivate() {
}