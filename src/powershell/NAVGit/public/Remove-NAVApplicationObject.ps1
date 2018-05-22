function Delete-NAVApplicationObject {
  [CmdletBinding(DefaultParameterSetName = "All", SupportsShouldProcess = $true, ConfirmImpact = 'High')]
  Param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $DatabaseName,
    [ValidateNotNullOrEmpty()]
    [string] $DatabaseServer = '.',
    [ValidateNotNullOrEmpty()]
    [string] $LogPath = "$Env:TEMP\NavIde\$([GUID]::NewGuid().GUID)",
    [string] $Filter,
    [ValidateSet('Yes', 'No', 'Force')]
    [string] $SynchronizeSchemaChanges = 'Yes',
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Username,
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Password,
    [ValidateNotNullOrEmpty()]
    [string] $NavServerName,
    [ValidateNotNullOrEmpty()]
    [string] $NavServerInstance,
    [ValidateNotNullOrEmpty()]
    [int16]  $NavServerManagementPort = 7045)

  if ($PSCmdlet.ShouldProcess(
      "Delete application objects from $DatabaseName database.",
      "Delete application objects from $DatabaseName database.",
      'Confirm')) {
        
    $commands = @()
    $commands += "Command=DeleteObjects"
    $commands += "SynchronizeSchemaChanges={0}" -f $SynchronizeSchemaChanges
    if ($Filter) {
      $commands += 'Filter="{0}"' -f $Filter
    }

    $command = $commands -join ","

    $navServerInfo = GetNavServerInfo $NavServerName $NavServerInstance $NavServerManagementPort

    try {
      RunNavIdeCommand -Command $command `
        -DatabaseServer $DatabaseServer `
        -DatabaseName $DatabaseName `
        -Username $Username `
        -Password $Password `
        -NavServerInfo $navServerInfo `
        -LogFile $logFile `
        -ErrText "Error while deleting $Filter" `
        -Verbose:$VerbosePreference
    }
    catch {
      Write-Error $_
    }
  }
}
