import { window, Terminal } from 'vscode';

export class TerminalRunner {

    private static instance: Terminal = null;
    
    static getTerminal(terminalName: string) {
        if (TerminalRunner.instance === null) {
            TerminalRunner.instance = window.createTerminal(terminalName);
        }
        return TerminalRunner.instance;
    }

    static showTerminal() {
        if (TerminalRunner.instance === null) 
            return
        TerminalRunner.instance.show();
    }
}