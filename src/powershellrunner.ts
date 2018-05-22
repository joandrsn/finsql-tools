import { PowerShellCommand, PowerShellVariable } from "./powershell";
import { window, Terminal } from "vscode";

const terminalIdentifier = 'Dynamics NAV Shell';
let terminal: Terminal = window.createTerminal(terminalIdentifier);

export function RunPowershellCommand(command: string, parameters: object) {
    let powershell: PowerShellCommand = new PowerShellCommand(command, parameters);
    terminal.sendText(powershell.GetExecutionCommand());
}

export function DefinePowershellVariable(variablename: string, value: any) {
    let powershellVariable: PowerShellVariable = new PowerShellVariable(variablename, value);
    terminal.sendText(powershellVariable.GetVariableDefinition());
}

export function ShowTerminal() {
    terminal.show();
}

export function RelaunchTerminal() {
    terminal.dispose();
    terminal = window.createTerminal(terminalIdentifier);
}