function stringifyParameter(input: any): string {
    if (input === null)
        return "$null"
    let inputtype = typeof input;
    if (inputtype === 'boolean')
        return `$${input}`
    if (inputtype === 'number')
        return `${input}`;
    if (Array.isArray(input))
        return "'" + input.join("','") + "'";
    if (inputtype === 'string') {
        let inputstring: string = input;
        if (inputstring[0] === '$')
            return `${inputstring}`
        inputstring = inputstring.replace('"', '`"');
        return `"${inputstring}"`
    }
    throw `Unsupported type '${input}'.`
}

export class PowerShellCommand {
    private command: string = null;
    private parameters: object = null;

    constructor(command: string, parameters: object) {
        this.command = command;
        this.parameters = parameters;
    }

    private stringifyParameters(): string {
        let settingsArray: string[] = [];
        for (let key in this.parameters) {
            let value = this.parameters[key];
            let parameterstring = value === null ? `-${key}` : `-${key} ${stringifyParameter(value)}`
            settingsArray.push(parameterstring);
        }
        return settingsArray.join(' ');
    }

    public GetExecutionCommand(): string {
        return `${this.command} ${this.stringifyParameters()}`;
    }
}

export class PowerShellVariable {
    private name: string = null;
    private value: any = null;

    constructor(name: string, value: any) {
        this.name = name;
        this.value = value;
    }

    public GetVariableDefinition(): string {
        return `$${this.name} = ${stringifyParameter(this.value)}`;
    }
}