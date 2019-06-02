export function runNavIdeCommand() {
  return `
function Invoke-NAVIdeCommand {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$NAVIDE,
    [Parameter(Mandatory)]
    [String]$Command,
    [Parameter(Mandatory)]
    [String]$ID
  )

  $guid = [Guid]::NewGuid().Guid
  $tempdir = Join-Path $env:temp $guid
  $null = New-Item -Type Directory $tempdir
  $logfile = Join-Path $tempdir "naverrorlog.txt"
  $commandresult = Join-Path $tempdir "navcommandresult.txt"
  $arguments = '{0},LogFile="{1}",ID="{2}"' -f $Command,$logfile,$ID

  #Start-Process -FilePath $NAVIDE -ArgumentList $arguments -Wait

  $errorraised = $false
  $output = ""

  if (Test-Path $commandresult) {
    if (Test-Path $logfile) {
      $content = Get-Content $logfile -Raw
      $output = $content -replace "\`r[^ \`n]","\`r\`n"
      $errorraised = $true
    }
  }
  Remove-Item $tempdir -Force -Recurse -ErrorAction Ignore

  if ($errorraised) {
    throw $output
  }
}`;
}