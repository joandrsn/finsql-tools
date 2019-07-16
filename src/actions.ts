import { RunPowershellCommand, ShowTerminal, RelaunchTerminal, RunRawPowershellCommand, setTerminalVariables, getCurrentSettings } from "./powershellrunner";
import { workspace, WorkspaceFolder, window, InputBoxOptions } from 'vscode';
import { join } from 'path';
import { existsSync, writeFile, mkdirSync } from 'fs';
import { ModifiedConfig } from "./enums";
import { ExtensionSettings } from "./settings";
import { getExportOptions, getStartOptions, getImportOptions, getCompileOptions } from "./finsqlfunctions";
import { getModificationScript } from "./objectmodification";

export function relaunchTerminal() {
  RelaunchTerminal();
  ShowTerminal();
}

export function exportAllFromNAV() {
  setTerminalVariables();
  let settings = getCurrentSettings();
  settings.export.filters = [undefined];
  exportSplitObjects(settings);
}

export function exportFiltersFromNAV() {
  setTerminalVariables();
  let settings = getCurrentSettings();
  let filters: string[] = settings.export.filters;
  if (filters.length === 0) {
    window.showErrorMessage('There are no filters set up in settings. Please add filters in "finsqltools.export.filters" in your settings.')
    return;
  }

  exportSplitObjects(settings);
}

function CreateTempFolder() {
  createFolderIfNotExists("temp");
}
function createFolderIfNotExists(foldername: string) {
  RunPowershellCommand("New-Item", { "ItemType": "Directory", "Path": foldername, "ErrorAction": "Ignore" })
}

function exportSplitObjects(settings: ExtensionSettings) {
  ShowTerminal();
  CreateTempFolder();
  let exportFolder = "temp/export/";
  let filename = `temp/export.txt`
  createFolderIfNotExists(exportFolder);

  settings.export.filters.forEach(filter => {
    let exportParameters = {
      "NAVIDE": "$NavIde",
      "Command": getExportOptions(filter, filename, settings),
    };
    RunPowershellCommand("Invoke-NAVIdeCommand", exportParameters);

    let splitParameters = {
      "Source": filename,
      "Destination": exportFolder,
      "PreserveFormatting": undefined,
      "Force": undefined,
      "ErrorAction": "Ignore",
    };

    RunPowershellCommand("Split-NAVApplicationObjectFile", splitParameters);
  }
  );
  let splitFiles = join(exportFolder, "*.txt");
  copyNAVObjectProperties(splitFiles);
  RunPowershellCommand("Move-Item", { "Path": splitFiles, "Destination": 'src/', "Force": undefined })
}

function copyNAVObjectProperties(splitLocation: string) {
  let settings = getCurrentSettings();
  let resetDate: boolean = settings.export.resetdate;
  let resetModified = settings.export.resetmodified;
  if (!resetDate && resetModified === ModifiedConfig.never)
    return

  RunPowershellCommand("Get-ChildItem", { "Path": splitLocation }, "ObjectFiles");
  const loopscript = getModificationScript();

  let splitScript = `foreach ($objectFile in $ObjectFiles) {
  ${loopscript}
}`
  RunRawPowershellCommand(splitScript);

}

function importObjects(from: string, to: string) {
  ShowTerminal();
  CreateTempFolder();
  let settings = getCurrentSettings();
  let compileafter: boolean = settings.import.compileafter;
  RunPowershellCommand("Invoke-Expression", { "Command": `git diff ${from}..${to} --name-only --diff-filter d src/` }, "ImportFiles")
  let importfile = "./temp/import.txt";
  RunPowershellCommand("New-Object", { "TypeName": "System.IO.FileStream", "ArgumentList": [importfile, 'Create', 'ReadWrite'] }, "StreamWriter");

  let joinScript =
    `foreach($ChangedFile in $ImportFiles) {
  $PathObj = Resolve-Path $ChangedFile
  $StreamReader = New-Object -TypeName "System.IO.FileStream" -ArgumentList $PathObj.Path, 'Open', 'Read'
  $StreamReader.CopyTo($StreamWriter)

  $StreamReader.Close()
  $StreamReader.Dispose()
}
$StreamWriter.Close()
$StreamWriter.Dispose()`;
  RunRawPowershellCommand(joinScript);

  let importParameters = {
    "Navide": "$Navide",
    "Command": getImportOptions(importfile, settings)
  }
  RunPowershellCommand("Invoke-NAVIdeCommand", importParameters);
  if (compileafter) {
    let compileparameters = {
      "Navide": "$Navide",
      "Command": getCompileOptions(settings),
    }
    RunPowershellCommand("Invoke-NAVIdeCommand", compileparameters);
  }
}

export function ImportObjects() {
  setTerminalVariables();
  let fromCommit = "";
  let toCommit = "";
  let settings = getCurrentSettings();
  let fromhash = settings.import.fromhash;
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
  ShowTerminal()
  generateGitAttributesFile();
  generateGitIgnoreFile();
  generateFolders(["src", "temp"]);
}

function generateFolders(paths: string[]) {
  let workdir = getWorkspacePath();
  paths.forEach(element => {
    let path = join(workdir, element);
    if (!existsSync(path))
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
    if (error)
      console.log("Error writing to .gitattributes.");
    RunPowershellCommand("Write-Host", { "Object": `Generated new .gitignore file (${gitignoreLocation})` })
  });
}

export function startNAVIDE() {
  setTerminalVariables();
  ShowTerminal();
  let currentSettings = getCurrentSettings();
  const arglist: string = getStartOptions(currentSettings);
  RunPowershellCommand("Start-Process", { "FilePath": "$NAVIde", "ArgumentList": arglist });
}