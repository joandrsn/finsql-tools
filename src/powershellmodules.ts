import { join } from "path";
import { existsSync } from "fs";


export function getModulesInstallPath(rtcPath: string, nstPath: string): string[] {
  let modules = ["Microsoft.Dynamics.Nav.Model.Tools.dll", "Microsoft.Dynamics.Nav.Ide.psm1", "Microsoft.Dynamics.Nav.Management.dll"];
  let importList: string[] = [];

  modules.forEach(element => {
    let moduleresult = testModulePath(rtcPath, nstPath, element);

    if (moduleresult !== undefined) {
      importList.push(moduleresult);
    }
  });

  return importList;
}

function testModulePath(rtcPath: string, nstPath: string, file: string): string {
  let rtcAbsolutePath = testIndividualPath(rtcPath, file);
  if (rtcAbsolutePath !== undefined) {
    return rtcAbsolutePath;
  }


  let nstAbsolutePath = testIndividualPath(nstPath, file);
  if (nstAbsolutePath !== undefined) {
    return nstAbsolutePath;
  }

  return undefined;
}

function testIndividualPath(path: string, file: string): string {
  if(path !== undefined) {
    let filepath = join(path, file);
    if (existsSync(filepath)) {
      return filepath;
    }
  }
  return undefined;
}