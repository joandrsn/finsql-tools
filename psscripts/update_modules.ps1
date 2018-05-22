$CurrentDir = Get-Location
$DestinationDir = Join-Path $currentdir 'temp'
$ModulesFile = Join-Path $PSScriptRoot 'psmodules.json'

$ObjectArray = Get-Content $ModulesFile | ConvertFrom-Json

$tempdir = Join-Path $env:temp (New-Guid).Guid
$null = New-Item -ItemType Directory -Path $tempdir
$OldProgressPreference = $ProgressPreference
$ProgressPreference = "SilentlyContinue"
foreach ($item in $ObjectArray) {
  Save-Module -Name $item.Name -RequiredVersion $item.Version -LiteralPath $tempdir
  $ItemDestination = Join-Path $DestinationDir $item.Name
  $null = New-Item -Path $ItemDestination -ItemType Directory -ErrorAction Ignore
  $SourceItems = Join-Path $tempdir $Item.Name
  $SourceVersion = Join-Path $SourceItems $item.Version
  $SourceObjects = Get-ChildItem $SourceVersion

  $SourceObjects | Copy-Item -Destination $ItemDestination -Force -Recurse
  $OutMsg = 'Saving module "{0}", Version {1}, to "{2}"' -f $Item.Name, $Item.Version, $ItemDestination
  Write-Output $OutMsg
}

Remove-Item $tempdir -ErrorAction Ignore -Recurse
$ProgressPreference = $OldProgressPreference