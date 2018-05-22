function Export-NAVApplicationObject {
  [CmdletBinding(DefaultParameterSetName = "All")]
  Param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $DatabaseName,
    [Parameter(Mandatory = $true, Position = 1)]
    [string] $Path,
    [ValidateNotNullOrEmpty()]
    [string] $DatabaseServer = '.',
    [ValidateNotNullOrEmpty()]
    [string] $LogPath = "$Env:TEMP\NavIde\$([GUID]::NewGuid().GUID)",
    [string] $Filter,
    [Switch] $ExportTxtSkipUnlicensed,
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Username,
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Password
  )
  Process {

    $skipUnlicensed = 0
    if ($ExportTxtSkipUnlicensed) {
      $skipUnlicensed = 1
    }
  
    $commands = @()
    $commands += "Command=ExportObjects"
    $commands += "ExportTxtSkipUnlicensed={0}" -f $skipUnlicensed
    $commands += 'File="{0}"' -f $Path
    if ($Filter) {
      $commands += 'Filter="{0}"' -f $Filter
    }
    $command = $commands -join ","
  
    try {
      Invoke-NAVIdeCommand -Command $command `
        -DatabaseServer $DatabaseServer `
        -DatabaseName $DatabaseName `
        -Username $Username `
        -Password $Password `
        -NavServerName $NavServerName `
        -NavServerInstance $NavServerInstance `
        -NavServerManagementPort $NavServerManagementPort `
        -LogPath $LogPath `
        -ErrorText "Error while exporting $Filter" `
        -Verbose:$VerbosePreference
    }
    catch {
      Write-Error $_
    }
  }
}
