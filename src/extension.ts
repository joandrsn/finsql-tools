'use strict';

import { ExtensionContext, commands } from 'vscode';
import { RunPowershellCommand, DefinePowershellVariable, ShowTerminal} from "./powershellrunner";
import { TerminalRunner } from "./terminal";
import { fdatasyncSync } from 'fs';
import { join } from 'path';
import * as action from './actions'

export function activate(context: ExtensionContext) {
    //initialize();
    action.initialize();
    let subs = context.subscriptions;

    subs.push(commands.registerCommand('extension.sayHello', action.sayHello));
    subs.push(commands.registerCommand('dynamicsnavscm.relaunchterminal', action.relaunchTerminal));
    subs.push(commands.registerCommand('dynamicsnavscm.generategitattributes', action.generateGitAttributesFile));
    subs.push(commands.registerCommand('dynamicsnavscm.exportfromnav', action.exportSplitObjects))

    /* let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
   
        RunPowershellCommand('Start-NAVIDE', {"DatabaseName": "$database"});
        
        RunPowershellCommand("write-host", {"Object": "Hello world"});
        RunPowershellCommand("write-host", {"Object": "Hello world" + __dirname, "ForegroundColor": "Red"});
        //RunPowershellCommand("$Database = ''" + database)
        //RunPowershellCommand("Start-Sleep", {"Seconds": 5});
        RunPowershellCommand("write-host", {"Object": "Hello world", "ForegroundColor": "Yellow"});
        RunPowershellCommand("write-host", {"Object": "Hello world", "ForegroundColor": "Green"});
        RunPowershellCommand("write-host", {"Object": "Hello world"});
        RunPowershellCommand("Remove-Item", {"Path": 'C:\\Temp\\fdsafdas'});
        RunPowershellCommand("write-host", { "Object": "Hello world" });
        ShowTerminal();
    }); */

}

function initialize() {
    var database = "TRANS-DEV-110"
    DefinePowershellVariable("database", database);
    DefinePowershellVariable("uidoffset", 57000);
    DefinePowershellVariable("stuff", true);
    DefinePowershellVariable("array", [1, 2, 3, 4, 5])
    DefinePowershellVariable("quotes", 'jonas"andersen');
    DefinePowershellVariable("NAVIDE", 'C:\\Program Files\\Microsoft Dynamics NAV\\TRANS-DEV-110\\RTC\\finsql.exe');
    RunPowershellCommand('Import-Module', { 'Name': join(__dirname, "powershell\\NAVDevEnv\\NAVDevEnv.psd1") })
}

// this method is called when your extension is deactivated
export function deactivate() {
}