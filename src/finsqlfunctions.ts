export function buildCommandArguments(command: string, startObj: object): string {
  let args: String[] = [];
  args.push(`command="${command}"`)
  Object.entries(startObj).forEach(
    ([key, value]) => {
      args.push(`${key}="${value}"`);
    }
  );
  return args.join(",");
}