import { DefinePowershellVariable, RunPowershellCommand, ShowTerminal, RelaunchTerminal } from "./powershellrunner";
import { workspace, env, WorkspaceFolder } from 'vscode';
import { join } from 'path';
import { existsSync, exists, writeFile } from 'fs';

export function initialize() {
  let config = workspace.getConfiguration('dynamicsnavscm');
  let rtcpath: string = config.get('rtcpath');
  let nstpath: string = config.get('nstpath');
  let databasename = config.get('databasename');
  let databaseserver = config.get('databaseserver');

  DefinePowershellVariable('RTCPath', rtcpath);
  DefinePowershellVariable('NAVIde', join(rtcpath, 'finsql.exe'));
  DefinePowershellVariable('NSTPath', nstpath);
  DefinePowershellVariable('Database', databasename);
  DefinePowershellVariable('Databaseserver', databaseserver);
  let modulesImportList = getInstallPathModules(rtcpath, nstpath);
  modulesImportList.forEach(element => {
    RunPowershellCommand('Import-Module', { "DisableNameChecking": null, "Name": element });
  });
}

function getInstallPathModules(rtcPath: string, nstPath: string): string[] {
  let modules = ["Microsoft.Dynamics.Nav.Model.Tools.dll", "Microsoft.Dynamics.Nav.Ide.psm1", "Microsoft.Dynamics.Nav.Management.dll"];
  let importList: string[] = [];
  modules.forEach(element => {
    let moduleresult = testModulePath(rtcPath, nstPath, element);
    if (moduleresult !== null)
      importList.push(moduleresult);
  });
  return importList;
}

function testModulePath(rtcPath: string, nstPath: string, file: string): string {
  if (rtcPath !== null) {
    let filepath = join(rtcPath, file);
    if (existsSync(filepath))
      return filepath;
  }
  if (nstPath !== null) {
    let filepath = join(nstPath, file);
    if (existsSync(filepath))
      return filepath;
  }
  return null;
}


export function sayHello() {
  console.log('Kenobi: Hello there.');
  console.log('Dooku: General Kenobi.');
  console.log(env.appRoot);
  console.log(workspace.workspaceFolders);
}

export function relaunchTerminal() {
  RelaunchTerminal();
  initialize();
  ShowTerminal();
}

export function exportSplitObjects() {
  let config = workspace.getConfiguration('dynamicsnavscm');
  let filters: string[] = config.get('exportfilters');
  let launchConfigs: object[] = [];
  let exportNumber: number = 1;
  if (filters.length === 0) {
    launchConfigs.push({ "Filter": null });
  } else {
    filters.forEach(element => {
      launchConfigs.push({ "Filter": element });
    });
  }
  launchConfigs.forEach(element => {
    let filename = `temp/export${exportNumber}.txt`
    let exportParameters = {
      'DatabaseName': "$Database",
      "Path": filename,
      "DatabaseServer": "$DatabaseServer",
      "Force": null,
      "ExportTxtSkipUnlicensed": null
    }
    if (element["Filter"] !== null)
      exportParameters["Filter"] = element["Filter"];
    RunPowershellCommand("Export-NAVApplicationObject", exportParameters)
    let splitParameters = {
      "Source": filename,
      "Destination": "src/",
      "PreserveFormatting": null,
      "Force": null
    }
    RunPowershellCommand("Split-NAVApplicationObjectFile", splitParameters);
    exportNumber += 1;
  });
  //if(not exportunlicensedasbinary)
  //return
}

function getWorkspacePath():string {
  let workspacefolders: WorkspaceFolder[] = workspace.workspaceFolders;
  if (workspacefolders === undefined)
    return undefined;
  return workspacefolders[0].uri.fsPath;
}

export function generateGitAttributesFile() {
  let workdir = getWorkspacePath();
  let gitattributesLocation = join(workdir, '.gitattributes');
  if (existsSync(gitattributesLocation))
    return
  let gitattibutesConfig = '* text=auto\n*.txt text eol=crlf\n*.fob binary';
  writeFile(gitattributesLocation, gitattibutesConfig, error => {
    console.log("Error writing to .gitattributes.");
  });
}