<#
    .SYNOPSIS
    Creates a new NAV application database.

    .DESCRIPTION
    The Create-NAVDatabase creates a new NAV database that includes the NAV system tables.

    .INPUTS
    None
    You cannot pipe input into this function.

    .OUTPUTS
    None

    .EXAMPLE
    Create-NAVDatabase MyNewApp
    Creates a new NAV database named MyNewApp.

    .EXAMPLE
    Create-NAVDatabase MyNewApp -ServerName "TestComputer01\NAVDEMO" -Collation "da-dk"
    Creates a new NAV database named MyNewApp on TestComputer01\NAVDEMO Sql server with Danish collation.
#>
function New-NAVDatabase {
  [CmdletBinding(DefaultParameterSetName = "All")]
  Param(
    # Specifies the name of the Dynamics NAV database that will be created.
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $DatabaseName,

    # Specifies the name of the SQL server instance on which you want to create the database. The default value is the default instance on the local host (.).
    [ValidateNotNullOrEmpty()]
    [string] $DatabaseServer = '.',

    # Specifies the collation of the database.
    [ValidateNotNullOrEmpty()]
    [string] $Collation,

    # Specifies the log folder.
    [ValidateNotNullOrEmpty()]
    [string] $LogPath = "$Env:TEMP\NavIde\$([GUID]::NewGuid().GUID)",


    # The user name to use to authenticate to the database. The user name must exist in the database. If you do not specify a user name and password, then the command uses the credentials of the current Windows user to authenticate to the database.
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Username,

    # The password to use with the username parameter to authenticate to the database. If you do not specify a user name and password, then the command uses the credentials of the current Windows user to authenticate to the database.
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Password)

  $logFile = (Join-Path $LogPath naverrorlog.txt)

  $command = "Command=CreateDatabase`,Collation=$Collation"
  
  $commands = @()
  $commands += "Command=CreateDatabase"
  if ($Collation) {
    $commands += 'Collation={0}' -f $Collation
  }
  $command = $commands -join ","

  try {
    RunNavIdeCommand -Command $command `
      -DatabaseServer $DatabaseServer `
      -DatabaseName $DatabaseName `
      -NTAuthentication:($Username -eq $null) `
      -Username $Username `
      -Password $Password `
      -NavServerInfo $navServerInfo `
      -LogFile $logFile `
      -ErrText "Error while creating $DatabaseName" `
      -Verbose:$VerbosePreference
  }
  catch {
    Write-Error $_
  }
}
