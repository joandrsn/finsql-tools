$tsconfig = Get-Content "tsconfig.json" | ConvertFrom-Json
$CurrentLocation = Get-Location
$DestinationDir = Join-Path $CurrentLocation $tsconfig.compilerOptions.outDir
$SourceCodeDir = Join-Path $CurrentLocation $tsconfig.compilerOptions.rootDir
$PowershellDir = Join-Path $SourceCodeDir "powershell"
Copy-Item -Recurse -Force $PowershellDir $DestinationDir 
Write-Output "Done copying from '$PowershellDir' to '$DestinationDir'"