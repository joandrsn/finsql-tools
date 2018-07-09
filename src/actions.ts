import { DefinePowershellVariable, RunPowershellCommand, ShowTerminal, RelaunchTerminal, RunRawPowershellCommand } from "./powershellrunner";
import { workspace, WorkspaceFolder, window, InputBoxOptions } from 'vscode';
import { join } from 'path';
import { existsSync, writeFile, mkdirSync} from 'fs';

export function initialize() {
  let config = workspace.getConfiguration('finsqltools');
  let rtcpath: string = config.get('rtcpath');
  let nstpath: string = config.get('nstpath');
  let databasename = config.get('databasename');
  let databaseserver = config.get('databaseserver');
  let silentprogresspreference = config.get('silentprogresspreference');

  DefinePowershellVariable('RTCPath', rtcpath);
  DefinePowershellVariable('NAVIde', join(rtcpath, 'finsql.exe'));
  DefinePowershellVariable('NSTPath', nstpath);
  DefinePowershellVariable('Database', databasename);
  DefinePowershellVariable('Databaseserver', databaseserver);
  if(silentprogresspreference)
    DefinePowershellVariable('ProgressPreference', "SilentlyContinue");
  let modulesImportList = getInstallPathModules(rtcpath, nstpath);
  modulesImportList.forEach(element => {
    RunPowershellCommand('Import-Module', { "Name": element, "DisableNameChecking": undefined });
  });
}

function getInstallPathModules(rtcPath: string, nstPath: string): string[] {
  let modules = ["Microsoft.Dynamics.Nav.Model.Tools.dll", "Microsoft.Dynamics.Nav.Ide.psm1", "Microsoft.Dynamics.Nav.Management.dll"];
  let importList: string[] = [];
  modules.forEach(element => {
    let moduleresult = testModulePath(rtcPath, nstPath, element);
    if (moduleresult !== undefined)
      importList.push(moduleresult);
  });
  return importList;
}

function testModulePath(rtcPath: string, nstPath: string, file: string): string {
  if (rtcPath !== undefined) {
    let filepath = join(rtcPath, file);
    if (existsSync(filepath))
      return filepath;
  }
  if (nstPath !== undefined) {
    let filepath = join(nstPath, file);
    if (existsSync(filepath))
      return filepath;
  }
  return undefined;
}

export function relaunchTerminal() {
  RelaunchTerminal();
  initialize();
  ShowTerminal();
}

export function exportAllFromNAV() {
  let launchConfigs: object[] = [];
  launchConfigs.push({ "Filter": undefined });
  exportSplitObjects(launchConfigs);
}

export function exportFiltersFromNAV() {
  let config = workspace.getConfiguration('finsqltools');
  let filters: string[] = config.get('export.filters');
/*   if (filters.length === 0) {
    window.showErrorMessage('There are no filters set up in settings. Please add filters in "finsqltools.export.filters" in your settings.')
    return;
  } */
  let launchConfigs: object[] = [];
  filters.forEach(element => {
    launchConfigs.push({ "Filter": element });
  });

  exportSplitObjects(launchConfigs);
}

function focusTerminal() {
  let config = workspace.getConfiguration('finsqltools');
  if (!config.get('focusterminalonaction'))
    return
  ShowTerminal();
}

function CreateTempFolder() {
  let foldername = "temp";
  if (existsSync(foldername)) 
    return;
  RunPowershellCommand("New-Item", { "ItemType": "Directory", "Path": foldername, "ErrorAction": "Ignore" })
}

function exportSplitObjects(launchConfigs: object[]) {
  focusTerminal();
  CreateTempFolder();
  let exportFolder = "temp/export/";
  let filename = `temp/export.txt`
  RunPowershellCommand("New-Item", { "ItemType": "Directory", "Path": exportFolder, "ErrorAction": "Ignore" })
  launchConfigs.forEach(element => {
    let exportParameters = {
      'DatabaseName': "$Database",
      "Path": filename,
      "DatabaseServer": "$DatabaseServer",
      "Force": undefined,
      "ExportTxtSkipUnlicensed": undefined
    }
    if (element["Filter"] !== undefined)
      exportParameters["Filter"] = element["Filter"];
    RunPowershellCommand("Export-NAVApplicationObject", exportParameters)

    let splitParameters = {
      "Source": filename,
      "Destination": exportFolder,
      "PreserveFormatting": undefined,
      "Force": undefined,
      "ErrorAction": "Ignore"
    }

    RunPowershellCommand("Split-NAVApplicationObjectFile", splitParameters);
  });
  let splitFiles = join(exportFolder, "*.txt");
  copyNAVObjectProperties(splitFiles);
  RunPowershellCommand("Move-Item", { "Path": splitFiles, "Destination": 'src/', "Force": undefined })
  //if(not exportunlicensedasbinary)
  //return
}

function copyNAVObjectProperties(splitLocation: string) {
  let config = workspace.getConfiguration('finsqltools');
  let resetDate: boolean = config.get('export.resetdate');
  let resetModified: boolean = config.get('export.resetmodified');
  if (!(resetDate || resetModified))
    return

  RunPowershellCommand("Get-ChildItem", { "Path": splitLocation }, "SplitFiles");
  let setCommand = "Set-NAVApplicationObjectProperty -TargetPath $exportedObject"
  let preSetCommand = [];
  if (resetModified) {
    preSetCommand.push("$ModifiedStatus = if ($origProps.Modified) {'Yes'} else {'No'}");
    setCommand += " -ModifiedProperty $ModifiedStatus"

  }
  if (resetDate) {
    preSetCommand.push(`$datetimeProp = $origProps.Date,$origProps.Time -join " "`);
    setCommand += " -DateTimeProperty $datetimeProp";
  }

  preSetCommand.push(setCommand);

  let splitScript = `foreach ($exportedObject in $SplitFiles) {
    $originalObject = Join-Path "src" $exportedObject.Name
    if(Test-Path $originalObject) {
      $origProps = Get-NAVApplicationObjectProperty -Source $originalObject
      $newProps = Get-NAVApplicationObjectProperty -Source $exportedObject
      `;
  splitScript += preSetCommand.join("\n      ");
  splitScript += `
    }
  }`
  RunRawPowershellCommand(splitScript);

}

function importObjects(from: string, to: string) {
  focusTerminal();
  CreateTempFolder();
  let config = workspace.getConfiguration('finsqltools');
  let compileafter: boolean = config.get('import.compileafter');
  RunPowershellCommand("Invoke-Expression", { "Command": `git diff ${from}..${to} --name-only --diff-filter d src/` }, "ImportFiles")
  let importfile = "temp/import.txt";
  RunPowershellCommand("Join-NAVApplicationObjectFile", { "Source": "$ImportFiles", "Destination": importfile, "Force": undefined });
  let importParameters = {
    "Path": importfile,
    "DatabaseName": "$Database",
    "DatabaseServer": "$DatabaseServer",
    "ImportAction": "Overwrite",
    "SynchronizeSchemaChanges": "No"
  }
  RunPowershellCommand("Import-NAVApplicationObject", importParameters);
  if (compileafter) {
    let compileparameters = {
      "DatabaseName": "$Database",
      "DatabaseServer": "$DatabaseServer",
      "SynchronizeSchemaChanges": "No"
    }
    RunPowershellCommand("Compile-NAVApplicationObject", compileparameters);
  }

}

export function ImportObjects() {
  let fromCommit = "";
  let toCommit = "";
  let config = workspace.getConfiguration('finsqltools');
  let fromhash: string = config.get('import.fromhash');
  let fromOptions: InputBoxOptions = {
    prompt: "From which git commit",
    value: fromhash
  }
  let toOptions: InputBoxOptions = {
    prompt: "To which git commit",
    value: "HEAD"
  }
  window.showInputBox(fromOptions).then(input => {
    fromCommit = input;
    if (fromCommit !== undefined && fromCommit !== "") {
      window.showInputBox(toOptions).then(input => {
        toCommit = input;
        if (toCommit !== undefined && toCommit !== "")
          importObjects(fromCommit, toCommit);
      });
    }
  });
}

function getWorkspacePath(): string {
  let workspacefolders: WorkspaceFolder[] = workspace.workspaceFolders;
  if (workspacefolders === undefined)
    return undefined;
  return workspacefolders[0].uri.fsPath;
}

export function generateNAVFolderStructure() {
  focusTerminal()
  generateGitAttributesFile();
  generateGitIgnoreFile();
  generateFolders(["src", "temp"]);
}

function generateFolders(paths: string[]) {
  let workdir = getWorkspacePath();
  paths.forEach(element => {
    let path = join(workdir, element);
    if(!existsSync(path))
      mkdirSync(path);
  }) 
}

function generateGitAttributesFile() {
  let workdir = getWorkspacePath();
  let gitattributesLocation = join(workdir, '.gitattributes');
  if (existsSync(gitattributesLocation))
    return
  let gitattibutesContent = '* text=auto\n*.txt text eol=crlf\n*.fob binary';
  writeFile(gitattributesLocation, gitattibutesContent, error => {
    if (error)
      console.log("Error writing to .gitattributes.");
    RunPowershellCommand("Write-Host", { "Object": `Generated new .gitattributes file (${gitattributesLocation})` })
  });
}

function generateGitIgnoreFile() {
  let workdir = getWorkspacePath();
  let gitignoreLocation = join(workdir, '.gitignore');
  if (existsSync(gitignoreLocation))
    return
  let gitignoreContent = 'temp\n.vscode';
  writeFile(gitignoreLocation, gitignoreContent, error => {
    if(error)
      console.log("Error writing to .gitattributes.");
    RunPowershellCommand("Write-Host", { "Object": `Generated new .gitignore file (${gitignoreLocation})` })
  });
}

export function startNAVIDE() {
  focusTerminal();
  let config = workspace.getConfiguration('finsqltools');
  let value = config.get('nstpath');
  let databaseServer = config.get('databaseserver')
  let database = config.get('databasename');
  let parameters: string[] = [];
  parameters.push(`ServerName="${databaseServer}"`);
  parameters.push(`Database="${database}"`);
  parameters.push(`ID="${database}"`);
  RunPowershellCommand("Start-Process", { "FilePath": "$NAVIde", "ArgumentList": parameters.join(",") });
}