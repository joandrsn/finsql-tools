import { PowerShell } from "./powershell";
import * as TerminalRunner from "./terminal";
import { Terminal } from "vscode";


export function RunPowershellCommand(command: string, parameters: object) {
    let t: Terminal = TerminalRunner.getTerminal('hello-world');
    let powershell: PowerShell = new PowerShell(command, parameters);
    t.sendText(powershell.GetExecutionCommand());
}


export function RunMultipleCommands(commands: object[]) {
    let t: Terminal = TerminalRunner.getTerminal('hello-world');
    //StartProcessindicator
    for(let command in commands) {
    }
}