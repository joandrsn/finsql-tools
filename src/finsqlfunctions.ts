import { ExtensionSettings } from "./settings";
import { SynchronizeSchemaChangesUtil } from "./enums";

function buildCommandArguments(command: string, params: object, settings: ExtensionSettings): string {
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
  options["exporttxtskipunlicensed"] = 1;
  if (filter !== undefined)
    options["filter"] = filter;

  return buildCommandArguments(command, options, settings);
}
export function getImportOptions(filename: string, settings: ExtensionSettings): string {
  const command = "importobjects";
  let options = getStandardOptions(settings);
  options["file"] = filename;
  options["importaction"] = "overwrite";
  options["synchronizeschemachanges"] = "no"

  return buildCommandArguments(command, options, settings);
}
export function getCompileOptions(settings: ExtensionSettings): string {
  const command = "compileobjects";
  let options = getStandardOptions(settings);
  options["filter"] = "compiled=0";
  options["synchronizeschemachanges"] = SynchronizeSchemaChangesUtil.toString(settings.import.synchronizeschemachanges);

  return buildCommandArguments(command, options, settings);
}
export function getStartOptions(settings: ExtensionSettings): string {
  let options = getStandardOptions(settings);

  return buildArgString(options);
}