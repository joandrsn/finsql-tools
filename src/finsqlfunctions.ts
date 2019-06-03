import { ExtensionSettings } from "./settings";

export function buildCommandArguments(command: string, params: object): string {
  params['command'] = command;
  return buildArgString(params);
}

function buildArgString(params: object): string {
  let args: String[] = [];
  Object.entries(params).forEach(
    ([key, value]) => {
      args.push(`${key}="${value}"`);
    }
  );
  return args.join(",");
}

function getStandardOptions(settings: ExtensionSettings): object {
  return {
    "database": settings.databasename,
    "id": settings.id,
    "servername": settings.databaseserver,
  };
}

export function getExportOptions(filter: string, filename: string, settings: ExtensionSettings): string {
  const command = "exportobjects";
  let options = getStandardOptions(settings);
  options["file"] = filename;
  options["ExportTxtSkipUnlicensed"] = 1;
  if (filter !== undefined)
    options["filter"] = filter;

  return buildCommandArguments(command, options);
}
export function getImportOptions(filename: string, settings: ExtensionSettings): string {
  const command = "importobjects";
  let options = getStandardOptions(settings);

  return buildCommandArguments(command, options);
}
export function getCompileOptions(settings: ExtensionSettings): string {
  const command = "compileobjects";
  let options = getStandardOptions(settings);

  return buildCommandArguments(command, options);
}
export function getStartOptions(settings: ExtensionSettings): string {
  let options = getStandardOptions(settings);

  return buildArgString(options);
}


// Import, export, compile, start

//Must have
// database, databaserver, 
//