function Test-NAVIde {
  Param()
  Process{
    if (-not $NavIde -or (($NavIde) -and -not (Test-Path $NavIde))) {
      throw '$NavIde was not correctly set. Please assign the path to finsql.exe to $NavIde ($NavIde = path).'
    }
  }
}
