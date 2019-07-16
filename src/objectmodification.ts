import { getCurrentSettings } from "./powershellrunner";
import { ModifiedConfig } from "./enums";

export function getModificationScript(): string {
  let settings = getCurrentSettings();
  let resetDate: boolean = settings.export.resetdate;
  let resetModified: ModifiedConfig = settings.export.resetmodified;
  let result = "";
  if (resetDate) {
    switch (resetModified) {
      case ModifiedConfig.copy:
        result = copyModData();
        break;
      case ModifiedConfig.never:
        result = copyDate();
        break;
      case ModifiedConfig.remove:
        result = copyDateRemoveModified();
        break;
    }
  } else {
    switch (resetModified) {
      case ModifiedConfig.copy:
        result = copyModified();
        break;
      case ModifiedConfig.never:
        break;
      case ModifiedConfig.remove:
        result = removeModified();
        break;
    }
  }
  return result;
}

function copyModData(): string {
  return `$originalObject = Join-Path "src" $objectFile.Name
if(Test-Path $originalObject) {
  $origProps = Get-NAVApplicationObjectProperty -Source $originalObject
  $ModifiedStatus = if ($origProps.Modified) {'Yes'} else {'No'}
  $datetimeProp = $origProps.Date,$origProps.Time -join " "
  Set-NAVApplicationObjectProperty -TargetPath $objectFile -ModifiedProperty $ModifiedStatus -DateTimeProperty $datetimeProp
}`;
}

function copyDate(): string {
  return `$originalObject = Join-Path "src" $objectFile.Name
if(Test-Path $originalObject) {
  $origProps = Get-NAVApplicationObjectProperty -Source $originalObject
  $datetimeProp = $origProps.Date,$origProps.Time -join " "
  Set-NAVApplicationObjectProperty -TargetPath $objectFile -DateTimeProperty $datetimeProp
}`;
}

function copyDateRemoveModified(): string {
  return `$originalObject = Join-Path "src" $objectFile.Name
if(Test-Path $originalObject) {
  $origProps = Get-NAVApplicationObjectProperty -Source $originalObject
  $datetimeProp = $origProps.Date,$origProps.Time -join " "
  Set-NAVApplicationObjectProperty -TargetPath $objectFile -ModifiedProperty 'No' -DateTimeProperty $datetimeProp
} else {
  Set-NAVApplicationObjectProperty -TargetPath $objectFile -ModifiedProperty 'No'
}`;
}

function copyModified(): string {
  return `$originalObject = Join-Path "src" $objectFile.Name
if(Test-Path $originalObject) {
  $origProps = Get-NAVApplicationObjectProperty -Source $originalObject
  $ModifiedStatus = if ($origProps.Modified) {'Yes'} else {'No'}
  Set-NAVApplicationObjectProperty -TargetPath $objectFile -ModifiedProperty $ModifiedStatus
}`;
}

function removeModified(): string {
  return "Set-NAVApplicationObjectProperty -TargetPath $objectFile -ModifiedProperty 'No'";
}