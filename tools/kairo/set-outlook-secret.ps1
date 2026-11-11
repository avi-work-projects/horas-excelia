# Ejecutar en PowerShell. SSH solicita el secreto en Kairo con la entrada oculta.
# La contraseña nunca se incluye en el comando ni vuelve a Codex.
param([switch]$Remove)
# Destino: alias "kairo" de ~/.ssh/config (usuario, clave y HostKeyAlias son
# locales y no se publican). $env:GESTIFY_KAIRO_SSH permite otro alias.
$sshTarget = if ($env:GESTIFY_KAIRO_SSH) { $env:GESTIFY_KAIRO_SSH } else { 'kairo' }
$remoteCommand = 'sudo "$HOME/gestify-outlook/hours-venv/bin/python" /usr/local/libexec/gestify-outlook-secret --config "$HOME/gestify-outlook/hours.json"'
if ($Remove) { $remoteCommand += ' --remove' }
& ssh -t $sshTarget $remoteCommand
if ($LASTEXITCODE -ne 0) { throw 'No se ha completado la configuración del secreto en Kairo.' }
