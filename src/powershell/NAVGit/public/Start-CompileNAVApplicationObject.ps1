<#
    .SYNOPSIS
    Compiles NAV application objects in a database.

    .DESCRIPTION
    The Compile-NAVApplicationObject function compiles application objects in the specified database. A filter can be specified to select the application objects to be compiled. Unless the Recompile switch is used only uncompiled objects are compiled.

    .INPUTS
    None
    You cannot pipe input to this function.

    .OUTPUTS
    None

    .EXAMPLE
    Compile-NAVApplicationObject MyApp
    Compiles all uncompiled application objects in the MyApp database.

    .EXAMPLE
    Compile-NAVApplicationObject MyApp -Filter 'Type=Codeunit' -Recompile
    Compiles all codeunits in the MyApp database.

    .EXAMPLE
    'Page','Codeunit','Table','XMLport','Report' | % { Compile-NAVApplicationObject -Database MyApp -Filter "Type=$_" -AsJob } | Receive-Job -Wait    
    Compiles all uncompiled Pages, Codeunits, Tables, XMLports, and Reports in the MyApp database in parallel and wait until it is done. Note that some objects may remain uncompiled due to race conditions. Those remaining objects can be compiled in a seperate command.

#>
function Start-CompileNAVApplicationObject {
  [CmdletBinding(DefaultParameterSetName = "All")]
  Param(
    # Specifies the name of the Dynamics NAV database.
    [Parameter(Mandatory = $true, Position = 0)]
    [string] $DatabaseName,

    # Specifies the name of the SQL server instance to which the Dynamics NAV database is attached. The default value is the default instance on the local host (.).
    [ValidateNotNullOrEmpty()]
    [string] $DatabaseServer = '.',

    # Specifies the log folder.
    [ValidateNotNullOrEmpty()]
    [string] $LogPath = "$Env:TEMP\NavIde\$([GUID]::NewGuid().GUID)",

    # Specifies the filter that selects the objects to compile.
    [string] $Filter,

    # Compiles objects that are already compiled.
    [Switch] $Recompile,

    # Compiles in the background returning an object that represents the background job.
    [Switch] $AsJob,
        
    # Specifies the schema synchronization behaviour. The default value is 'Yes'.
    [ValidateSet('Yes', 'No', 'Force')]
    [string] $SynchronizeSchemaChanges = 'Yes',

    # The user name to use to authenticate to the database. The user name must exist in the database. If you do not specify a user name and password, then the command uses the credentials of the current Windows user to authenticate to the database.
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Username,

    # The password to use with the username parameter to authenticate to the database. If you do not specify a user name and password, then the command uses the credentials of the current Windows user to authenticate to the database.
    [Parameter(Mandatory = $true, ParameterSetName = "DatabaseAuthentication")]
    [string] $Password,

    # Specifies the name of the server that hosts the Microsoft Dynamics NAV Server instance, such as MyServer.
    [ValidateNotNullOrEmpty()]
    [string] $NavServerName,

    # Specifies the Microsoft Dynamics NAV Server instance that is being used.The default value is DynamicsNAV90.
    [ValidateNotNullOrEmpty()]
    [string] $NavServerInstance = "DynamicsNAV90",

    # Specifies the port on the Microsoft Dynamics NAV Server server that the Microsoft Dynamics NAV Windows PowerShell cmdlets access. The default value is 7045.
    [ValidateNotNullOrEmpty()]
    [int16]  $NavServerManagementPort = 7045)
    
  if (-not $Recompile) {
    $Filter += ';Compiled=0'
    $Filter = $Filter.TrimStart(';')
  }

  if ($AsJob) {
    $LogPath = "$LogPath\$([GUID]::NewGuid().GUID)"
    Remove-Item $LogPath -ErrorAction Ignore -Recurse -Confirm:$False -Force
    $scriptBlock =
    {
      Param($ScriptPath, $NavIde, $DatabaseName, $DatabaseServer, $LogPath, $Filter, $Recompile, $SynchronizeSchemaChanges, $Username, $Password, $NavServerName, $NavServerInstance, $NavServerManagementPort, $VerbosePreference)

      Import-Module "$ScriptPath\Microsoft.Dynamics.Nav.Ide.psm1" -ArgumentList $NavIde -Force -DisableNameChecking

      $args = @{
        DatabaseName             = $DatabaseName
        DatabaseServer           = $DatabaseServer
        LogPath                  = $LogPath
        Filter                   = $Filter
        Recompile                = $Recompile
        SynchronizeSchemaChanges = $SynchronizeSchemaChanges
      }

      if ($Username) {
        $args.Add("Username", $Username)
        $args.Add("Password", $Password)
      }

      if ($NavServerName) {
        $args.Add("NavServerName", $NavServerName)
        $args.Add("NavServerInstance", $NavServerInstance)
        $args.Add("NavServerManagementPort", $NavServerManagementPort)
      }

      Compile-NAVApplicationObject @args -Verbose:$VerbosePreference
    }

    $job = Start-Job $scriptBlock -ArgumentList $PSScriptRoot, $NavIde, $DatabaseName, $DatabaseServer, $LogPath, $Filter, $Recompile, $SynchronizeSchemaChanges, $Username, $Password, $NavServerName, $NavServerInstance, $NavServerManagementPort, $VerbosePreference
    return $job
  }
  else {
    try {
      $logFile = (Join-Path $LogPath naverrorlog.txt)
      $navServerInfo = GetNavServerInfo $NavServerName $NavServerInstance $NavServerManagementPort     
      $command = "Command=CompileObjects`,SynchronizeSchemaChanges=$SynchronizeSchemaChanges"
      if ($Filter) {
        $command = "$command,Filter=`"$Filter`""
      }

      RunNavIdeCommand -Command $command `
        -DatabaseServer $DatabaseServer `
        -DatabaseName $DatabaseName `
        -NTAuthentication:($Username -eq $null) `
        -Username $Username `
        -Password $Password `
        -NavServerInfo $navServerInfo `
        -LogFile $logFile `
        -ErrText "Error while compiling $Filter" `
        -Verbose:$VerbosePreference
    }
    catch {
      Write-Error $_
    }
  }
}
