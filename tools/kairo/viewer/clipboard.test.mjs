import test from 'node:test';
import assert from 'node:assert/strict';
import { ClipboardBridge, encodeX11Text, decodeX11Text } from './clipboard.mjs';

test('el adaptador de x11vnc conserva los bytes UTF-8 en el canal clásico de noVNC', () => {
  const text='Texto de Kairo: áéíóú ñ € 👋\nSegunda línea: Aa1!@#ñ-_/';
  const encoded=encodeX11Text(text);
  assert.deepEqual(Uint8Array.from(encoded,c=>c.charCodeAt(0)),new TextEncoder().encode(text));
  assert.equal(decodeX11Text(encoded),text);
  assert.throws(()=>decodeX11Text(String.fromCharCode(0xff)),TypeError);
});

function fixture(overrides = {}) {
  const calls = [], written = [], timers = new Map();
  let timerId = 0;
  const bridge = new ClipboardBridge({
    remote: {
      clipboardPasteFrom: text => calls.push(['clipboard', text]),
      sendKey: (...args) => calls.push(['key', ...args])
    },
    local: { readText: async () => 'Texto local', writeText: async text => { written.push(text); } },
    report: (...args) => calls.push(['status', ...args]),
    schedule: fn => { timers.set(++timerId, fn); return timerId; },
    cancel: id => timers.delete(id),
    ...overrides
  });
  return { bridge, calls, written, timers };
}

test('pegar conserva texto multilínea y Unicode y actualiza el portapapeles antes de Ctrl+V', () => {
  const { bridge, calls } = fixture();
  const text = 'Línea 1: ñ, € y 👋\nLínea 2: Aa1!@#ñ-_/';
  bridge.paste(text);
  assert.deepEqual(calls.filter(call => call[0] !== 'status'), [
    ['clipboard', text], ['key', 0xffe3, 'ControlLeft', true],
    ['key', 118, 'KeyV', true], ['key', 118, 'KeyV', false],
    ['key', 0xffe3, 'ControlLeft', false]
  ]);
});

test('recibir datos del servidor no sobrescribe el portapapeles local sin una acción de copia', async () => {
  const { bridge, written } = fixture();
  bridge.receive('Dato recibido sin solicitarlo');
  await Promise.resolve();
  assert.deepEqual(written, []);
  bridge.requestCopy();
  bridge.receive('Selección que sí se ha copiado');
  await Promise.resolve();
  assert.deepEqual(written, ['Selección que sí se ha copiado']);
});

test('volver a copiar el mismo texto funciona aunque el servidor no emita otro cambio', async () => {
  const { bridge, written, timers } = fixture();
  bridge.receive('Selección remota');
  bridge.requestCopy();
  assert.equal(written.length, 0);
  [...timers.values()][0]();
  await Promise.resolve();
  assert.deepEqual(written, ['Selección remota']);
});

test('una lectura de permiso tardía no pega después de perder el contexto o desconectar', async () => {
  let finish;
  const { bridge, calls } = fixture({ local: { readText: () => new Promise(resolve => { finish = resolve; }) } });
  const pending = bridge.pasteLocal();
  bridge.dispose();
  finish('Texto que no debe pegarse');
  await pending;
  assert.equal(calls.length, 0);
});

test('un permiso denegado informa del fallo y no reutiliza contenido anterior', async () => {
  const { bridge, calls } = fixture({ local: { readText: async () => { throw new Error('not allowed'); } } });
  await bridge.pasteLocal();
  assert.equal(calls.filter(call => call[0] === 'key' || call[0] === 'clipboard').length, 0);
  assert.equal(calls.at(-1)[2], true);
});

test('mantiene Control mientras se sostiene y permite liberarlo al soltar o salir del visor', () => {
  const { bridge, calls } = fixture({ controlHeld: () => true });
  bridge.paste('Prueba');
  assert.equal(calls.some(call => call[0] === 'key' && call[1] === 0xffe3 && call[3] === false), false);
  bridge.releaseControl();
  assert.deepEqual(calls.slice(-2), [['key', 0xffe3, 'ControlLeft', false], ['key', 0xffe4, 'ControlRight', false]]);
});
