param(
    [string]$Runtime = (Join-Path $env:LOCALAPPDATA 'GestifyFacturacion/modelos'),
    [int]$Port = 18766,
    [string]$Pythonw = (Join-Path $env:LOCALAPPDATA 'Programs/Python/Python314/pythonw.exe')
)
$ErrorActionPreference = 'Stop'
$configPath = Join-Path $Runtime 'desktop.json'
if (-not (Test-Path -LiteralPath (Join-Path $Runtime 'config.json'))) { throw 'Instala primero el entorno existente de Modelos.' }
if (-not (Test-Path -LiteralPath $Pythonw)) { throw 'No se encuentra Python para Windows.' }
$manual = Get-Content -LiteralPath (Join-Path $Runtime 'amazon-manual.json') -Raw | ConvertFrom-Json
if (Test-Path -LiteralPath $configPath) {
    $settings = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
    $stateRoot = $settings.state_root
} else {
    $stateRoot = Join-Path $Runtime 'desktop-state'
    $settings = [ordered]@{models_config=(Join-Path $Runtime 'config.json');order_path=$manual.default_order;account=$manual.account_email;state_root=$stateRoot;port=$Port;pythonw=$Pythonw}
}
# Stop only the exact installed desktop process during an explicit reinstall.
# Neither Kairo's service, income generation nor the event listener is changed.
$instance = Join-Path $stateRoot 'instance.json'
if (Test-Path -LiteralPath $instance) {
    $running = Get-Content -LiteralPath $instance -Raw | ConvertFrom-Json
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($running.pid)" -ErrorAction SilentlyContinue
    $expectedScript = (Join-Path $Runtime 'code/desktop_app.py').Replace('\','/')
    if ($process -and $process.CommandLine.Replace('\','/').Contains($expectedScript)) {
        Stop-Process -Id $running.pid
    }
}
$code = Join-Path $Runtime 'code'
$backup = Join-Path $Runtime ('backups/desktop-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$files = @('desktop_app.py','desktop_help.py','desktop_transport.py','desktop_remote.py','desktop_intake.py','desktop_billing.py','vat_dashboard.py','aeat_client.py','aeat_submission.py','aeat_windows.py','aeat_windows.ps1','aeat_workflow.py','aeat_web.py')
$files += @('assistant_requests.py','ledger.py','expense_policy.py','expense_workflow.py','modelos_web.py','accounting_workbook.py','accounting_views.py','export_303_test.py','period_workflow.py','export_390.py','prepare_390.py','annual_workflow.py','review_year.py','reconcile_open.py')
New-Item -ItemType Directory -Path $backup -Force | Out-Null
foreach ($file in $files) {
    $target = Join-Path $code $file
    if (Test-Path -LiteralPath $target) { Copy-Item -LiteralPath $target -Destination (Join-Path $backup $file) }
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination $target
}
if (Test-Path -LiteralPath (Join-Path $code 'desktop_assets')) {
    Copy-Item -LiteralPath (Join-Path $code 'desktop_assets') -Destination $backup -Recurse
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'desktop_assets') -Destination $code -Recurse -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'launch-desktop.ps1') -Destination (Join-Path $Runtime 'launch-desktop.ps1')
$settings | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding utf8
$link = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Kairo Contabilidad.lnk'
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($link)
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32/WindowsPowerShell/v1.0/powershell.exe'
$shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $Runtime 'launch-desktop.ps1') + '"'
$shortcut.WorkingDirectory = $Runtime
$shortcut.Description = 'Contabilidad del mini: ingresos, gastos, libros, modelos y recogida manual.'
$shortcut.WindowStyle = 7
$shortcut.Save()
Write-Output ('Instalado. Acceso directo: ' + $link)
Write-Output 'No se han añadido tareas programadas ni comprobaciones periódicas.'
