param(
    [string]$Pdf,
    [switch]$Resume,
    [string]$OrderPath
)
$ErrorActionPreference = 'Stop'
if ($Pdf -and $Resume) { throw 'Elige un PDF o reanudar el lote, no ambos.' }
$modelosRoot = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'GestifyFacturacion/modelos'
$manualPath = Join-Path $modelosRoot 'amazon-manual.json'
$manual = Get-Content -LiteralPath $manualPath -Raw | ConvertFrom-Json
if ($manual.schema_version -ne 1) { throw 'Configuración manual de Amazon no compatible.' }
if (-not $OrderPath) { $OrderPath = $manual.default_order }
if (-not $OrderPath -or -not $manual.python) { throw 'Faltan el pedido o Python en la configuración manual.' }
$orderArgs = @('-B', (Join-Path $modelosRoot 'code/amazon_order.py'),
    '--config', (Join-Path $modelosRoot 'config.json'), '--order', $OrderPath)
if ($Pdf) {
    $orderArgs += @('--input', $Pdf, '--source-kind', 'invoice')
} elseif ($Resume) {
    $orderArgs += '--resume'
} else {
    $orderArgs += '--status'
}
$previousPythonPath = $env:PYTHONPATH
try {
    $env:PYTHONPATH = (Join-Path $modelosRoot 'code') + [IO.Path]::PathSeparator + (Join-Path $modelosRoot 'deps')
    & $manual.python @orderArgs
    if ($LASTEXITCODE -ne 0) { throw 'La factura no quedó confirmada en Kairo. Revisa el resultado; el lote se puede reanudar.' }
} finally {
    $env:PYTHONPATH = $previousPythonPath
}
