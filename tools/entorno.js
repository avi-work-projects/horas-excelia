/* ============================================================
   ENTORNO DE PRUEBAS — un navegador de mentira, lo justo para que
   los modulos carguen y las funciones renderXxx() devuelvan su HTML.

   Los renderXxx() son funciones puras: construyen un string y no tocan
   el DOM. Lo unico que necesitan de fuera es localStorage (que se lee al
   cargar el modulo) y un Date fijo, para que la salida no cambie segun
   el dia en que se pasen las pruebas.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

/* Modulos que solo declaran cosas. init.js e import-export.js quedan fuera
   a proposito: enganchan listeners al cargar y necesitarian un DOM de verdad. */
const MODULOS = [
  'core.js',
  'summary.js',
  /* El grupo economico: son los que hacen cuentas (IRPF, tramos, hipoteca,
     subrogacion) y por tanto donde un error no se ve mirando la pantalla. */
  'economics-helpers.js',
  'economics.js',
  'economics-fiscal.js',
  'economics-fiscal-hip.js',
  'economics-gastos.js',
  'events-picker-color.js',
  'events-picker-date.js',
  'events.js',
  'events-render.js',
  'events-form.js',
  'events-detail.js',
  'events-bind.js',
  'bodas.js',
  'rutinas.js',
  'birthdays.js',
  'alarms.js',
];

/* Un dia cualquiera pero SIEMPRE el mismo: si "hoy" cambiara, cambiarian
   las clases de pasado/futuro y las instantaneas no valdrian para nada. */
const HOY = new Date(2026, 7, 21, 9, 0, 0);   // viernes 21/08/2026

function falsoLocalStorage(inicial) {
  const datos = Object.assign({}, inicial);
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(datos, k) ? datos[k] : null; },
    setItem(k, v) { datos[k] = String(v); },
    removeItem(k) { delete datos[k]; },
    key(i) { return Object.keys(datos)[i] || null; },
    get length() { return Object.keys(datos).length; },
    _datos: datos,
  };
}

function falsoElemento() {
  const el = {
    style: {}, dataset: {}, classList: {
      add() {}, remove() {}, toggle() {}, contains() { return false; },
    },
    children: [], value: '', textContent: '', innerHTML: '',
    appendChild() {}, remove() {}, addEventListener() {}, removeEventListener() {},
    setAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, getBoundingClientRect() { return {top:0,left:0,width:0,height:0,right:0,bottom:0}; },
    focus() {}, click() {}, scrollIntoView() {},
  };
  return el;
}

function falsoDocument() {
  return {
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return falsoElemento(); },
    createTextNode() { return {}; },
    addEventListener() {}, removeEventListener() {},
    documentElement: falsoElemento(),
    body: falsoElemento(),
    head: falsoElemento(),
  };
}

/* Crea un contexto nuevo con los modulos ya cargados y el estado del fixture
   metido en localStorage. Devuelve el objeto global, desde el que se pueden
   llamar las funciones de la app. */
function cargarApp(claves) {
  const g = {
    console,
    localStorage: falsoLocalStorage(claves || {}),
    document: falsoDocument(),
    navigator: { userAgent: 'pruebas', vibrate() {} },
    location: { href: 'http://localhost/', reload() {} },
    requestAnimationFrame(fn) { return 0; },
    cancelAnimationFrame() {},
    setTimeout() { return 0; },
    clearTimeout() {},
    setInterval() { return 0; },
    clearInterval() {},
    alert() {}, confirm() { return true; }, prompt() { return null; },
    fetch() { return Promise.reject(new Error('sin red en pruebas')); },
    matchMedia() { return { matches: false, addListener() {}, addEventListener() {} }; },
  };
  g.window = g;
  g.globalThis = g;

  /* Date congelado: new Date() sin argumentos siempre da el mismo instante */
  const DateReal = Date;
  function DateFijo(...args) {
    if (!(this instanceof DateFijo)) return new DateReal(HOY.getTime()).toString();
    if (args.length === 0) return new DateReal(HOY.getTime());
    return new DateReal(...args);
  }
  DateFijo.prototype = DateReal.prototype;
  DateFijo.now = () => HOY.getTime();
  DateFijo.parse = DateReal.parse;
  DateFijo.UTC = DateReal.UTC;
  g.Date = DateFijo;

  vm.createContext(g);
  for (const m of MODULOS) {
    const src = fs.readFileSync(path.join(RAIZ, 'js', m), 'utf8');
    try {
      vm.runInContext(src, g, { filename: 'js/' + m });
    } catch (e) {
      throw new Error('No carga js/' + m + ': ' + e.message);
    }
  }
  return g;
}

module.exports = { cargarApp, HOY, MODULOS, RAIZ };
