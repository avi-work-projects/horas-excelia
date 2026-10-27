const CTRL_LEFT = 0xffe3;
const CTRL_RIGHT = 0xffe4;

// x11vnc entrega bytes UTF-8 por el canal CutText clásico, que noVNC 1.6
// interpreta como Latin-1. Este adaptador es específico de ese servidor.
export function encodeX11Text(text) {
  return Array.from(new TextEncoder().encode(text), byte => String.fromCharCode(byte)).join('');
}

export function decodeX11Text(text) {
  return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(text, char => char.charCodeAt(0)));
}

// No persiste ni registra el texto; recibir un portapapeles no autoriza copiarlo.
export class ClipboardBridge {
  constructor({ remote, local, report, controlHeld = () => false,
    schedule = (callback, delay) => setTimeout(callback, delay),
    cancel = timer => clearTimeout(timer) }) {
    Object.assign(this, { remote, local, report, controlHeld, schedule, cancel });
    this.cached = null;
    this.copyTimer = null;
    this.copyRequest = 0;
    this.copySequence = 0;
    this.active = true;
  }

  sendChord(letter, keepControl = false) {
    this.remote.sendKey(CTRL_LEFT, 'ControlLeft', true);
    try {
      this.remote.sendKey(letter.charCodeAt(0), `Key${letter.toUpperCase()}`, true);
    } finally {
      this.remote.sendKey(letter.charCodeAt(0), `Key${letter.toUpperCase()}`, false);
      if (!keepControl) this.remote.sendKey(CTRL_LEFT, 'ControlLeft', false);
    }
  }

  paste(text) {
    if (!this.active || typeof text !== 'string' || !text.length) return;
    // El mensaje del portapapeles precede a Ctrl+V en el mismo canal RFB.
    this.remote.clipboardPasteFrom(text);
    this.sendChord('v', this.controlHeld());
    this.report('Texto enviado a Kairo.');
  }

  async pasteLocal(stillRequested = () => true) {
    try {
      const text = await this.local.readText();
      if (this.active && stillRequested()) this.paste(text);
    } catch {
      if (this.active) this.report('Permite el acceso al portapapeles y vuelve a pulsar Pegar en Kairo.', true);
    }
  }

  requestCopy(sendShortcut = false) {
    if (!this.active) return;
    this.cancel(this.copyTimer);
    const request = ++this.copySequence;
    this.copyRequest = request;
    this.report('Copiando desde Kairo…');
    if (sendShortcut) this.sendChord('c', this.controlHeld());
    // Si se copia otra vez el mismo texto, el servidor puede no notificar cambios.
    this.copyTimer = this.schedule(() => {
      if (this.copyRequest !== request) return;
      if (this.cached !== null) void this.writeLocal(this.cached, request);
      else {
        this.copyRequest = 0;
        this.report('Selecciona texto en Kairo y pulsa Ctrl+C.');
      }
    }, 800);
  }

  receive(text) {
    if (!this.active || typeof text !== 'string') return;
    this.cached = text;
    if (this.copyRequest) void this.writeLocal(text, this.copyRequest);
  }

  async writeLocal(text, request) {
    if (!this.active || this.copyRequest !== request) return;
    this.copyRequest = 0;
    this.cancel(this.copyTimer);
    try {
      await this.local.writeText(text);
      if (this.active) this.report('Texto copiado al portapapeles de este equipo.');
    } catch {
      if (this.active) this.report('Permite el acceso al portapapeles y vuelve a pulsar Copiar selección.', true);
    }
  }

  releaseControl() {
    if (!this.active) return;
    this.remote.sendKey(CTRL_LEFT, 'ControlLeft', false);
    this.remote.sendKey(CTRL_RIGHT, 'ControlRight', false);
  }

  dispose() {
    this.active = false;
    this.cached = null;
    this.copyRequest = 0;
    this.cancel(this.copyTimer);
  }
}
