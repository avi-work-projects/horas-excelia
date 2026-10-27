#!/bin/sh
# Sesión manual de Outlook, aislada del servicio de facturas.
# Los tres puertos escuchan exclusivamente en loopback. Acceso por túnel SSH.
# No contiene credenciales ni ejecuta acciones sobre el correo.
set -eu
umask 077
if [ "$(id -u)" = 0 ]; then
  echo 'Ejecutar como el propietario del perfil, sin sudo.' >&2
  exit 1
fi
state_dir=${GESTIFY_OUTLOOK_STATE:-"$HOME/gestify-outlook"}
case "$state_dir" in
  /*) ;;
  *) echo 'El directorio privado debe ser absoluto.' >&2; exit 1 ;;
esac
if [ -z "${GESTIFY_OUTLOOK_DISPLAY:-}" ]; then
  exec xvfb-run --server-num=95 --auto-servernum --server-args='-screen 0 1280x900x24 -nolisten tcp' env GESTIFY_OUTLOOK_DISPLAY=1 "$0"
fi
mkdir -p "$state_dir/profile/Default"
chmod 700 "$state_dir" "$state_dir/profile" "$state_dir/profile/Default"
if [ ! -f "$state_dir/profile/Default/Preferences" ]; then
  printf '%s\n' '{"credentials_enable_service":false,"profile":{"password_manager_enabled":false}}' > "$state_dir/profile/Default/Preferences"
fi
browser_pid= vnc_pid= web_pid=
cleanup(){
  trap - EXIT INT TERM
  for child in "$browser_pid" "$vnc_pid" "$web_pid"; do
    if [ -n "$child" ]; then kill "$child" 2>/dev/null || true; fi
  done
}
trap cleanup EXIT INT TERM
# noVNC sincroniza CapsLock; evitar aplicar Shift dos veces cuando está activo.
x11vnc -display "$DISPLAY" -auth "$XAUTHORITY" -localhost -listen 127.0.0.1 -no6 -rfbport 5901 -forever -shared -capslock -nopw -quiet > "$state_dir/vnc.log" 2>&1 &
vnc_pid=$!
websockify --web=/usr/share/novnc 127.0.0.1:6091 127.0.0.1:5901 > "$state_dir/viewer.log" 2>&1 &
web_pid=$!
chromium --user-data-dir="$state_dir/profile" --no-first-run --no-default-browser-check --disable-dev-shm-usage --disable-gpu --remote-debugging-address=127.0.0.1 --remote-debugging-port=9223 --log-level=3 'https://outlook.office.com/mail/' > "$state_dir/browser.log" 2>&1 &
browser_pid=$!
wait "$browser_pid"
