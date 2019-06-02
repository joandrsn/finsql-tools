import { PowerShellCommand, PowerShellVariable } from "./powershell";
import { window, Terminal } from "vscode";
import * as Settings from "./settings";
import { getModulesInstallPath } from "./powershellmodules";
import { runNavIdeCommand } from "./powershellfunctions";

const terminalIdentifier = 'Finsql tools Shell';
let terminal: Terminal = undefined;
let currentSettings = undefined;

export function RunPowershellCommand(command: string, parameters: object, variablename?: string) {
    let powershell: PowerShellCommand = new PowerShellCommand(command, parameters);
    terminal.sendText(powershell.GetExecutionCommand(variablename));
}

export function DefinePowershellVariable(variablename: string, value: any) {
    let powershellVariable: PowerShellVariable = new PowerShellVariable(variablename, value);
    terminal.sendText(powershellVariable.GetVariableDefinition());
}

export function ShowTerminal() {
    if (!currentSettings.focusterminalonaction)
        return
    terminal.show();
}

export function RelaunchTerminal() {
    currentSettings = undefined;
    setTerminalVariables();
}

export function RunRawPowershellCommand(command: string) {
    terminal.sendText(command);
}

export function setTerminalVariables() {
    let settings = Settings.load();
    if(hasCriticalSettingsChanged(settings)){
        respawnTerminal(settings);
    }
    currentSettings = settings;
}

function respawnTerminal(settings){
    if (terminal !== undefined)
        terminal.dispose();
    terminal = window.createTerminal(terminalIdentifier);
    DefinePowershellVariable('RTCPath', settings.rtcpath);
    DefinePowershellVariable('NAVIde', settings.navide);
    DefinePowershellVariable('NSTPath', settings.nstpath);
    DefinePowershellVariable('Database', settings.databasename);
    DefinePowershellVariable('Databaseserver', settings.databaseserver);
    if (settings.silentprogresspreference)
        DefinePowershellVariable('ProgressPreference', "SilentlyContinue");
    let modulesImportList = getModulesInstallPath(settings.rtcpath, settings.nstpath);
    modulesImportList.forEach(element => {
        RunPowershellCommand('Import-Module', { "Name": element, "DisableNameChecking": undefined });
    });
    RunRawPowershellCommand(runNavIdeCommand());
}

function hasCriticalSettingsChanged(newSettings){
    if (currentSettings === undefined)
        return true;
    return (currentSettings.rtcpath !== newSettings.rtcpath) || 
        (currentSettings.nstpath !== newSettings.nstpath) ||
        (currentSettings.databasename !== newSettings.databasename) ||
        (currentSettings.databaseserver !== newSettings.databaseserver);
}

export function getCurrentSettings() {
    return Object.assign({}, currentSettings);
}
