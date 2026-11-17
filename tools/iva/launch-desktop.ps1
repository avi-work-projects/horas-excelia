param([string]$Config = (Join-Path $env:LOCALAPPDATA 'GestifyFacturacion/modelos/desktop.json'))
$ErrorActionPreference = 'Stop'
$settings = Get-Content -LiteralPath $Config -Raw | ConvertFrom-Json
$runtime = Split-Path -Parent $Config
$env:PYTHONPATH = (Join-Path $runtime 'code') + ';' + (Join-Path $runtime 'deps')
$env:PYTHONUTF8 = '1'
$program = Join-Path $runtime 'code/desktop_app.py'
# Hidden helper; the browser is the application's visible window.
Start-Process -FilePath $settings.pythonw -ArgumentList @('-B', ('"' + $program + '"'), '--config', ('"' + $Config + '"'), '--open') -WindowStyle Hidden
