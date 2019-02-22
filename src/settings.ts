import { workspace, WorkspaceConfiguration } from "vscode";
import { ModifiedConfig } from "./modifiedenum";
import { join } from "path";

const finsqlToolsId = "finsqltools";


export function load() {
  let configuration: WorkspaceConfiguration = workspace.getConfiguration(finsqlToolsId);

  let rtcpath = configuration.get<string>('rtcpath');
  return {
    "rtcpath": rtcpath,
    "navide": join(rtcpath, "finsql.exe"),
    "nstpath": configuration.get<string>('nstpath'),
    "databasename": configuration.get<string>('databasename'),
    "databaseserver": configuration.get<string>('databaseserver'),
    "silentprogresspreference": configuration.get<boolean>('silentprogresspreference', true),
    "focusterminalonaction": configuration.get<boolean>('focusterminalonaction', true),
    "export": {
      "filters": configuration.get<string>('export.filters'),
      "resetdate": configuration.get<boolean>('export.resetdate', true),
      "resetmodified": configuration.get<ModifiedConfig>('export.resetmodified', ModifiedConfig.copy)
    },
    "import": {
      "compileafter": configuration.get<boolean>('import.compileafter', true),
      "fromhash": configuration.get<string>('import.fromhash', 'HEAD~1')
    }
  };
}