import { window, Terminal } from 'vscode';

let terminal: Terminal = null;

export function getTerminal(terminalName: string) {
    if (terminal === null) {
        
        terminal = window.createTerminal('hello world');
    }
    return terminal;
}

export function showTerminal() {
    if(terminal === null) 
        return
    terminal.show();
}