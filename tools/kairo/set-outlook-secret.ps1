# Ejecutar en PowerShell. SSH solicita el secreto en Kairo con la entrada oculta.
# La contraseña nunca se incluye en el comando ni vuelve a Codex.
param([switch]$Remove)
$sshKey = Join-Path $env:USERPROFILE '.ssh/raspberry_casa'
$remoteCommand = 'sudo "$HOME/gestify-outlook/hours-venv/bin/python" /usr/local/libexec/gestify-outlook-secret --config "$HOME/gestify-outlook/hours.json"'
if ($Remove) { $remoteCommand += ' --remove' }
& ssh -t -i $sshKey -o HostKeyAlias=kairo.local angel@kairo $remoteCommand
if ($LASTEXITCODE -ne 0) { throw 'No se ha completado la configuración del secreto en Kairo.' }
