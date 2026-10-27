import RFB from '/core/rfb.js';
import { initLogging } from '/core/util/logging.js';
import { ClipboardBridge, encodeX11Text, decodeX11Text } from './clipboard.mjs';

// Los registros de depuración de noVNC pueden contener teclas y portapapeles.
initLogging('warn');
const screen = document.getElementById('screen');
const message = document.getElementById('message');
const connection = document.getElementById('connection');
const caps = document.getElementById('caps');
const copy = document.getElementById('copy');
const paste = document.getElementById('paste');
const reconnect = document.getElementById('reconnect');
const socket = new URL('/websockify', location.href);
socket.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const rfb = new RFB(screen, socket.href, { shared: true });
rfb.scaleViewport = true;
rfb.resizeSession = false;
let connected = false;
let controlHeld = false;
let pasteRequest = 0;
let pasteTimer;
const report = (text, error = false) => {
  message.textContent = text;
  message.dataset.error = String(error);
};
const bridge = new ClipboardBridge({
  remote: {
    sendKey: (...args) => rfb.sendKey(...args),
    clipboardPasteFrom: text => rfb.clipboardPasteFrom(encodeX11Text(text))
  },
  local: {
    readText: () => navigator.clipboard.readText(),
    writeText: text => navigator.clipboard.writeText(text)
  },
  report,
  controlHeld: () => controlHeld
});
const inDesktop = target => screen.contains(target);

document.addEventListener('keydown', event => {
  if (!inDesktop(event.target) || !connected) return;
  controlHeld = event.ctrlKey;
  const locked = event.getModifierState('CapsLock');
  caps.textContent = locked ? 'Bloq Mayús activado' : 'Bloq Mayús desactivado';
  caps.dataset.on = String(locked);
  if (!event.ctrlKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (key === 'c' || key === 'x') bridge.requestCopy();
  if (key !== 'v') return;
  // Dejar que el navegador emita "paste", pero no adelantar un Ctrl+V remoto.
  event.stopImmediatePropagation();
  if (event.repeat) { event.preventDefault(); return; }
  clearTimeout(pasteTimer);
  const request = ++pasteRequest;
  pasteTimer = setTimeout(() => {
    if (request !== pasteRequest) return;
    void bridge.pasteLocal(() => request === pasteRequest && document.hasFocus());
  }, 150);
}, true);

document.addEventListener('paste', event => {
  if (!connected || !inDesktop(event.target)) return;
  ++pasteRequest;
  clearTimeout(pasteTimer);
  event.preventDefault();
  event.stopImmediatePropagation();
  try { bridge.paste(event.clipboardData.getData('text/plain')); }
  catch { report('No se pudo transferir el texto. Vuelve a pulsar Pegar en Kairo.', true); }
}, true);

// Algunos navegadores y sus menús de edición emiten "copy" sin keydown.
document.addEventListener('copy', event => {
  if (!connected || !inDesktop(event.target)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!bridge.copyRequest) bridge.requestCopy(true);
}, true);

document.addEventListener('keyup', event => {
  controlHeld = event.ctrlKey;
  if (!controlHeld && event.key === 'Control') bridge.releaseControl();
}, true);
window.addEventListener('blur', () => {
  controlHeld = false;
  ++pasteRequest;
  clearTimeout(pasteTimer);
  bridge.releaseControl();
});
copy.addEventListener('click', () => {
  if (!connected) return;
  rfb.focus();
  bridge.requestCopy(true);
});
paste.addEventListener('click', () => {
  if (!connected) return;
  const request = ++pasteRequest;
  rfb.focus();
  void bridge.pasteLocal(() => request === pasteRequest && document.hasFocus());
});
reconnect.addEventListener('click', () => location.reload());
rfb.addEventListener('clipboard', event => {
  try { bridge.receive(decodeX11Text(event.detail.text)); }
  catch { report('El texto recibido de Kairo no tiene una codificación compatible.', true); }
});
rfb.addEventListener('connect', () => {
  connected = true;
  connection.textContent = 'Conectado';
  copy.disabled = paste.disabled = false;
});
rfb.addEventListener('disconnect', () => {
  connected = false;
  ++pasteRequest;
  clearTimeout(pasteTimer);
  bridge.dispose();
  connection.textContent = 'Desconectado';
  copy.disabled = paste.disabled = true;
  reconnect.hidden = false;
  report('Pulsa Reconectar para volver al escritorio.');
});
rfb.addEventListener('securityfailure', () => report('No se ha podido establecer la conexión privada.', true));
