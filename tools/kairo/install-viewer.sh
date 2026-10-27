#!/bin/sh
# Instala únicamente los recursos públicos del visor, nunca el perfil del correo.
set -eu
source_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
target=/usr/share/novnc/gestify
test -f /usr/share/novnc/core/rfb.js
sudo -n install -d -m 755 "$target"
for file in index.html viewer.js clipboard.mjs input-test.html; do
  sudo -n install -m 644 "$source_dir/viewer/$file" "$target/$file"
done
printf '%s\n' 'Visor instalado en /gestify/index.html del túnel existente.'
