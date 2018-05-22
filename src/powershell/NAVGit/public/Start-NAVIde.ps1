function Start-NAVIde {
  [CmdletBinding(DefaultParameterSetName = 'All')]
  Param(
    [Parameter(Mandatory)]
    [String]$DatabaseServer,
    [Parameter(Mandatory)]
    [String]$DatabaseName,
    [Parameter(ParameterSetName = 'UsernamePassword', Mandatory)]
    [String]$DatabaseUsername,
    [Parameter(ParameterSetName = 'UsernamePassword', Mandatory)]
    [String]$DatabasePassword
  )

  Test-NavIde

  if (-not ([System.Management.Automation.PSTypeName]'WindowsUITricks').Type)
  {
    Add-Type -TypeDefinition @"
    using System;
    using System.Runtime.InteropServices;
    public class WindowsUITricks {
      [DllImport("user32.dll")]
      [return: MarshalAs(UnmanagedType.Bool)]
      public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);
    }
"@ -Debug:$false
  }

  #Show running window if available.
  $process = Get-Process | Where-Object {$PSItem.Path -eq $NAVIDE}
  if ($process) {
    [void] [WindowsUITricks]::ShowWindowAsync($process.MainWindowHandle, 2)
    [void] [WindowsUITricks]::ShowWindowAsync($process.MainWindowHandle, 10)
    return
  }

  $parameters = @()
  $parameters += 'ServerName="{0}"' -f $DatabaseServer
  $parameters += 'Database="{0}"' -f $DatabaseName
  $parameters += 'ID="{0}"' -f $DatabaseName
  if ($PSCmdlet.ParameterSetName -eq "UsernamePassword") {
    $parameters += 'NTAuthentication=1'
    $parameters += 'username="{0}"' -f $DatabaseUsername
    $parameters += 'password="{1}"' -f $DatabasePassword
  }
  $parameterstring = $parameters -join ","

  Start-Process -FilePath $NAVIde -ArgumentList $parameterstring
}