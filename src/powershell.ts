export class PowerShell {
    public command: string = null;
    public parameters: object = null;

    constructor(command: string, parameters: object) {
        this.command = command;
        this.parameters = parameters;
    }

    private stringifyParameter(input: any): any {
        if(Array.isArray(input))
            return "'" + input.join("','") + "'";
        if(typeof input === 'boolean')
            return `$${input}`
        if(typeof input === 'number')
            return input;
        return `"${input}"`;
    }

    private stringifyParameters(): string {
        let settingsArray: string[] = [];
        for(let key in this.parameters){
            let parametervalue = this.stringifyParameter(this.parameters[key]);
            let parameterstring = `-${key} ${parametervalue}`
            settingsArray.push(parameterstring);
        }
        return settingsArray.join(' ');
    }
    /**
     * GetExecutionCommand
     */
    public GetExecutionCommand(): string {
        return `${this.command} ${this.stringifyParameters()}`;
    }
}