import { workspace, WorkspaceConfiguration } from "vscode";
import { ModifiedConfig } from "./modifiedenum";
import { join } from "path";
import { convertModifiedConfigFromString } from "./modifiedenum";

const finsqlToolsId = "finsqltools";


export function load(): ExtensionSettings {
  let configuration: WorkspaceConfiguration = workspace.getConfiguration(finsqlToolsId);

  let rtcpath = configuration.get<string>('rtcpath');

  let extensionExportSettings: ExtensionExportSettings = new ExtensionExportSettings();
  extensionExportSettings.filters = configuration.get<string[]>('export.filters');
  extensionExportSettings.resetdate = configuration.get<boolean>('export.resetdate', true);
  let modifiedconfig: string = configuration.get<string>('export.resetmodified', 'copy');
  extensionExportSettings.resetmodified = convertModifiedConfigFromString(modifiedconfig);

  let extensionImportSettings: ExtensionImportSettings = new ExtensionImportSettings();
  extensionImportSettings.compileafter = configuration.get<boolean>('import.compileafter', true);
  extensionImportSettings.fromhash = configuration.get<string>('import.fromhash', 'HEAD~1');


  let settings: ExtensionSettings = new ExtensionSettings();
  settings.rtcpath = rtcpath;
  settings.navide = join(rtcpath, "finsql.exe");
  settings.nstpath = configuration.get<string>('nstpath');
  settings.databasename = configuration.get<string>('databasename');
  settings.id = configuration.get<string>('id', "");
  if (settings.id === "")
    settings.id = settings.databasename;
  settings.databaseserver = configuration.get<string>('databaseserver');
  settings.silentprogresspreference = configuration.get<boolean>('silentprogresspreference', true);
  settings.focusterminalonaction = configuration.get<boolean>('focusterminalonaction', true);
  settings.export = extensionExportSettings;
  settings.import = extensionImportSettings;

  return settings;
}

export class ExtensionSettings {
  rtcpath: string;
  navide: string;
  id: string;
  nstpath: string;
  databasename: string;
  databaseserver: string;
  silentprogresspreference: boolean;
  focusterminalonaction: boolean;
  export: ExtensionExportSettings;
  import: ExtensionImportSettings;

  constructor() {

  }

  /**
   * hasSameBaseSettings
   */
  public hasSameBaseSettings(other: ExtensionSettings): boolean {
    return (this.rtcpath === other.rtcpath) &&
      (this.nstpath === other.nstpath) &&
      (this.databasename === other.databasename) &&
      (this.databaseserver === other.databaseserver) &&
      (this.id === other.id);
  }
}

export class ExtensionExportSettings {
  filters: string[];
  resetdate: boolean;
  resetmodified: ModifiedConfig;

  constructor() {

  }
}

export class ExtensionImportSettings {
  compileafter: boolean;
  fromhash: string;

  constructor() {

  }
}