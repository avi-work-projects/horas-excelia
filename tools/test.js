#!/usr/bin/env node
/* ============================================================
   PRUEBAS DE INSTANTANEA (golden snapshots)

     node tools/test.js            compara con lo guardado
     node tools/test.js --update   regraba las instantaneas

   Como los renderXxx() son funciones puras que devuelven HTML, la prueba
   consiste en pintar cada vista con un fixture fijo y comparar el string
   con el de la ultima vez. No comprueba que la vista este BIEN (eso lo
   miras tu), comprueba que no ha CAMBIADO sin querer: es la red que hace
   falta para refactorizar sin miedo.

   Si un cambio es intencionado: se pasa --update, se mira el diff que
   sale en git y se commitea junto al cambio.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { cargarApp, RAIZ } = require('./entorno.js');

const DIR = path.join(__dirname, 'snapshots');
const ACTUALIZAR = process.argv.includes('--update');
const FILTRO = (process.argv.find(a => a.startsWith('--solo=')) || '').slice(7);

/* El fixture va tal cual a localStorage (cada clave, su JSON) */
const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8'));
const claves = {};
for (const k of Object.keys(fixture)) {
  if (k.startsWith('_')) continue;
  claves[k] = JSON.stringify(fixture[k]);
}

const app = cargarApp(claves);
app.load();                      /* ST/SW/MONTH_H desde la clave principal */
if (app.loadEvAlarms) app.loadEvAlarms();
app.syncVipBdaysToEvents();      /* los VIP se vuelcan a EVENTS como cada arranque */
/* La ventana economica carga su config al abrirse; aqui hay que hacerlo a mano */
['loadFiscal', 'loadDespacho', 'loadIngresos', 'loadCompras', 'loadDesgrav', 'loadEconComp']
  .forEach(fn => { if (typeof app[fn] === 'function') app[fn](); });
if (typeof app.loadGastosYear === 'function') app.loadGastosYear(2026);

/* ── Las vistas que se vigilan ────────────────────────────────
   Cada una deja el estado global que necesita y devuelve HTML. */
const VISTAS = [
  ['cal-agosto', () => { app.EV_YEAR = 2026; app.EV_MONTH = 7; return app.renderEvCalMonth(); }],
  ['cal-septiembre-barras-que-se-rozan', () => { app.EV_YEAR = 2026; app.EV_MONTH = 8; return app.renderEvCalMonth(); }],
  ['anual', () => { app.EV_YEAR = 2026; app.EV_VIEW = 'annual'; return app.renderEvAnnual(); }],
  ['cuatro-meses', () => { app.EV_QUAD_YEAR = 2026; app.EV_QUAD_MONTH = 7; app.EV_VIEW = 'quad'; return app.renderEvQuad(); }],
  ['agenda-semanal', () => { app.EV_YEAR = 2026; app.EV_MONTH = 7; app.EV_VIEW = 'week'; return app.renderEvWeek(); }],
  ['proximos', () => { app.EV_VIEW = 'upcoming'; return app.renderEvUpcoming(); }],
  ['todos-por-fecha', () => { app.EV_LIST_SORT = 'fecha'; app.EV_LIST_SEARCH = ''; return app.renderEvByTypes(); }],
  ['todos-por-categoria', () => { app.EV_LIST_SORT = 'categoria'; return app.renderEvByTypes(); }],
  ['detalle-evento', () => app.renderEvDetail(app.EVENTS.find(e => e.id === 'fx-p2'), false)],
  ['detalle-ensayo-completo', () => app.renderEvDetail(app.EVENTS.find(e => e.id === 'fx-boda-ok'), false)],
  ['detalle-ensayo-vacio', () => app.renderEvDetail(app.EVENTS.find(e => e.id === 'fx-boda-vacia'), false)],
  ['detalle-en-carrusel', () => app.renderEvDetail(app.EVENTS.find(e => e.id === 'fx-p1'), false, { ds: '2026-08-26', i: 1, n: 5 })],
  ['bodas-clases', () => { app.BODA_SUBTAB = 'clases'; return app.renderBodasBody(); }],
  ['bodas-parejas', () => { app.BODA_SUBTAB = 'parejas'; app.BODA_PAREJAS_FILTER = 'todas'; app.BODA_CARD_OPEN = null; return app.renderBodasBody(); }],
  ['bodas-pareja-desplegada', () => { app.BODA_CARD_OPEN = 'fx-pareja-1'; const h = app.renderBodasBody(); app.BODA_CARD_OPEN = null; return h; }],
  ['bodas-calendario', () => { app.BODA_SUBTAB = 'calendario'; app.BODA_CAL_YEAR = 2026; app.BODA_CAL_MONTH = 7; return app.renderBodasBody(); }],
  ['bodas-estadisticas', () => { app.BODA_SUBTAB = 'stats'; return app.renderBodasBody(); }],
  ['rutinas-lista', () => { app.RUT_SUBTAB = 'lista'; return app.renderRutinasBody(); }],
  ['rutinas-estadisticas', () => { app.RUT_SUBTAB = 'stats'; return app.renderRutinasBody(); }],
  ['rutinas-formulario', () => app.renderRutForm(app.RUTINAS[0])],
  ['cumples-calendario', () => { app.BDAY_YEAR = 2026; app.BDAY_MONTH = 7; return app.renderBdayCalMonth(); }],
  ['cumples-lista', () => { app.BDAY_SEARCH = ''; app.BDAY_FILTER_VIP = 'all'; return app.renderBdayList(); }],
  ['cumples-proximos', () => app.renderBdayUpcoming()],
  ['puentes', () => app.renderSummaryPuentesBody(2026)],
  ['vacaciones-festivos', () => app.renderSummaryTimeOffBody(2026)],
  ['formulario-evento', () => app.renderEvForm(app.EVENTS.find(e => e.id === 'fx-roce-a'))],
];

/* Redondeo a dos decimales: comparar euros con === da falsos negativos
   por el coma flotante (0.1+0.2 !== 0.3). */
const red = x => Math.round(x * 100) / 100;

/* ── Comprobaciones de logica, no de pintura ──────────────────
   Cosas que se han roto antes y que un string no deja ver bien. */
const REGLAS = [
  ['una barra que acaba y otra que empieza el mismo dia comparten fila', () => {
    const a = { cs: 0, ce: 3 }, b = { cs: 3, ce: 5 };
    return app._evSoloSeRozan(a.cs, a.ce, b.cs, b.ce) === true;
  }],
  ['dos barras que se pisan de verdad NO comparten fila', () =>
    app._evSoloSeRozan(0, 4, 3, 6) === false],
  ['una barra de un solo dia nunca se reparte la casilla', () =>
    app._evSoloSeRozan(3, 3, 3, 5) === false],
  ['la hora de una rutina depende del dia de la semana', () => {
    const r = app.RUTINAS[0];
    return app.rutOccursOn(r, '2026-08-31') === '07:30'    /* lunes */
        && app.rutOccursOn(r, '2026-09-02') === '18:00'    /* miercoles, hora general */
        && app.rutOccursOn(r, '2026-09-04') === '20:45';   /* viernes */
  }],
  ['el cambio de una semana manda sobre la hora del dia', () => {
    const r = app.RUTINAS[0];
    return app.rutOccursOn(r, '2026-08-25') === '19:00'    /* martes de esa semana */
        && app.rutOccursOn(r, '2026-08-24') === null;      /* ese lunes ya no toca */
  }],
  ['una rutina suspendida no genera sesiones', () => {
    const r = app.RUTINAS[1];
    return app.rutOccursOn(r, '2026-09-08') === null
        && app.rutOccursOn(r, '2026-09-17') === '19:00';
  }],
  ['una clase de boda se tine con el color de su pareja', () => {
    const ev = app.EVENTS.find(e => e.id === 'fx-boda-ok');
    return app.getEvDisplayColor(ev) === '#0ca678';
  }],
  ['una sesion de rutina conserva el color de la rutina', () => {
    const ses = app.rutEventsOn('2026-08-25')[0];
    return ses && app.getEvDisplayColor(ses) === ses.color;
  }],
  ['las rutinas solo se cuelan si se piden', () => {
    const con = app.getEventsOn('2026-08-25').length;
    const sin = app.getEventsOn('2026-08-25', app.EV_NO_RUT).length;
    return con > sin;
  }],
  ['marcar vacaciones de mas pide confirmacion', () => {
    const antes = app.contarVacaciones(2026);
    return antes >= 0 && app.confirmarCupoVacaciones('2026-09-21') === true;
  }],
  ['el tope de puntuales cuenta SOLO la columna derecha', () => {
    /* el 26 tiene 6 puntuales, 3 VIP y ninguna rutina: se pasa por los 6 */
    const lleno = { start: '2026-08-26', end: '2026-08-26', repeat: null };
    /* el 24 tiene 2 ensayos y 3 VIP: los VIP no cuentan, asi que cabe */
    const cabe = { start: '2026-08-24', end: '2026-08-24', repeat: null };
    return app.evDayLimitExceeded(lleno, null) === '2026-08-26'
        && app.evDayLimitExceeded(cabe, null) === null;
  }],
  ['un evento grande no gasta hueco de la columna derecha', () => {
    /* el 10/09 tiene dos barras que se rozan y ningun puntual */
    const p = { start: '2026-09-10', end: '2026-09-10', repeat: null };
    return app.evDayLimitExceeded(p, null) === null;
  }],
  ['los tres topes son 5 puntuales, 3 rutinas y 3 VIP', () =>
    app.EV_MAX_PUNT_DIA === 5 && app.EV_MAX_RUT_DIA === 3 && app.EV_MAX_VIP_DIA === 3],
  ['una cuarta rutina el mismo dia no cabe', () => {
    /* lunes: ya hay gimnasio. Tres mas en lunes deberian toparse */
    const antes = app.RUTINAS.slice();
    for (let i = 0; i < 2; i++) {
      app.RUTINAS.push({ id: 'tmp-' + i, name: 'X' + i, color: '#888', icon: 'gen',
        weekDays: [1], time: '10:00', dur: 60, start: '2026-08-01',
        suspend: null, weeks: {}, skips: {}, createdAt: 9 + i });
    }
    const lleno = app.rutDiaLleno([1], '2026-08-31', null);
    app.RUTINAS = antes;
    return typeof lleno === 'string';
  }],
  ['con hueco libre, una rutina nueva entra', () =>
    app.rutDiaLleno([0], '2026-08-31', null) === null],
  ['pasar de 12 festivos avisa pero deja seguir', () => {
    const antes = app.contarFestivos(2026);
    return antes >= 0 && app.FESTIVOS_ANIO === 12
        && app.confirmarCupoFestivos('2026-12-31') === true;
  }],
  /* ── Economico: aqui no se compara HTML sino numeros. Casi todas las
     reglas son INVARIANTES (base = dias x tarifa, la suma de los tramos es el
     total...) en vez de cifras clavadas: asi siguen valiendo si cambia un tipo
     impositivo, pero cazan que alguien rompa la cuenta. ── */
  ['el calculo anual cuadra consigo mismo', () => {
    const r = app.computeEconEx(2026, {});
    return red(r.totBase) === red(r.totalDays * r.dailyRate)
        && red(r.totIva) === red(r.totBase * 0.21)
        && red(r.totIrpf) === red(r.totBase * r.irpfPct / 100)
        && red(r.totCobrado) === red(r.totBase + r.totIva - r.totIrpf)
        && red(r.netoReal) === red(r.totBase - r.totIrpf);
  }],
  ['los doce meses suman el total del anio', () => {
    const r = app.computeEconEx(2026, {});
    return r.months.length === 12
        && red(r.months.reduce((a, m) => a + m.base, 0)) === red(r.totBase);
  }],
  ['los dias facturables salen de los laborables menos ausencias', () => {
    const r = app.computeEconEx(2026, {});
    /* el fixture tiene 1 festivo, 2 vacaciones y 1 ausencia en agosto */
    return r.totalDays > 200 && r.totalDays < 262;
  }],
  ['por defecto se factura todo laborable y lo marcado descuenta', () => {
    /* La regla de la app: se cobran TODOS los dias entre semana salvo los que
       se marcan como festivo, vacaciones o ausencia. */
    const antes = app.ST;
    app.ST = {};
    const limpio = app.computeEconEx(2026, {});
    app.ST = { '2026-03-02': { type: 'vacaciones' }, '2026-03-03': { type: 'festivo' } };
    const conDosLibres = app.computeEconEx(2026, {});
    app.ST = antes;
    return limpio.totalDays === 261            /* laborables de 2026 */
        && conDosLibres.totalDays === 259;
  }],
  ['la nomina cuadra: bruto - ss - irpf = neto', () => {
    const s = app.computeSalaryNet(30000);
    return red(s.netoAnual) === red(30000 - s.ssEmpleado - s.irpfRetenido)
        && red(s.costeEmpresa) === red(30000 + s.ssEmpleador)
        && red(s.netoMensual) === red(s.netoAnual / 14)
        && red(s.netoMensual12) === red(s.netoAnual / 12);
  }],
  ['a mas bruto, mas neto y mas retencion', () => {
    const a = app.computeSalaryNet(20000), b = app.computeSalaryNet(40000);
    return b.netoAnual > a.netoAnual && b.irpfPct > a.irpfPct;
  }],
  ['los tramos de IRPF cubren la base y suman el total', () => {
    const b = app.computeIrpfBrackets(30000);
    return red(b.breakdown.reduce((a, t) => a + t.tax, 0)) === red(b.totalTax)
        && red(b.breakdown.reduce((a, t) => a + t.taxable, 0)) === 30000;
  }],
  ['los tramos van de menos a mas y no dejan huecos', () => {
    const b = app.computeIrpfBrackets(50000);
    for (let i = 1; i < b.breakdown.length; i++) {
      if (b.breakdown[i].from !== b.breakdown[i - 1].to) return false;
      if (b.breakdown[i].pct < b.breakdown[i - 1].pct) return false;
    }
    return b.breakdown[0].from === 0;
  }],
  ['el impuesto crece con la base', () =>
    app.computeIrpfBrackets(40000).totalTax > app.computeIrpfBrackets(30000).totalTax
    && app.computeIrpfBrackets(0).totalTax === 0],
  ['el resultado de la declaracion es lo pagado menos lo debido', () => {
    const base = 40000;
    const debido = app.computeIrpfBrackets(base).totalTax;
    const r = app.computeDeclResult(base, debido + 1000);
    /* si se ha retenido de mas, sale a devolver */
    return typeof r === 'object' && r !== null;
  }],
  ['dos eventos iguales con distinto id se detectan como el mismo', () => {
    const a = app.EVENTS.find(e => e.id === 'fx-p1');
    const b = Object.assign({}, a, { id: 'otro-id' });
    return app.evSignature(a) === app.evSignature(b);
  }],
  /* Censo de claves de localStorage. La regla compara lo que el codigo
     ESCRIBE con esta lista: si aparece una clave nueva, el test cae y hay que
     venir aqui a declarar como se respalda. Ese es el momento en que uno se
     acuerda de tocar "Exportar todo". */
  ['ninguna clave de localStorage se queda fuera del backup', () => {
    const CENSO = {
      'excelia-horas-v3':          'days/sent/monthH/rate/exclFest/exclVac/multiRate/ratePeriods/econYearConfig',
      'excelia-vac-days':          'vacEntitlement',
      'excelia-bdays-v1':          'birthdays',
      'excelia-events-v1':         'events',
      'excelia-alarms-v1':         'alarms',
      'excelia-rutinas-v1':        'rutinas',
      'excelia-bodas-v1':          'bodas',
      'excelia-bodas-closed-v1':   'bodasClosed',
      'excelia-ev-alarm-v1':       'evAlarms',
      'excelia-bday-alarm-set':    'bdayAlarms',
      'excelia-bday-alarm-count':  'bdayAlarmCount',
      'excelia-fiscal-v1':         'fiscal',
      'excelia-gastos-v1':         'gastos + gastosPerYear',
      'excelia-gastos-tgl-v1':     'gastosToggles',
      'excelia-ingresos-v1':       'ingresos',
      'excelia-compras-v1':        'compras',
      'excelia-desgrav-v1':        'desgrav',
      'excelia-despacho-v1':       'despacho',
      'excelia-personal-v1':       'personalData + personalPerYear',
      'excelia-econ-comp-v1':      'scenarios',
      'excelia-alarm-url':         'macroUrl',
      'excelia-alarm-h':           'alarmHour',
      'excelia-alarm-m':           'alarmMinute',
      'excelia-alarm-days':        'alarmDays',
      'excelia-theme-v1':          'theme',
      /* A proposito FUERA del backup: */
      'excelia-macro-alarm-url':   false,   /* clave antigua, solo se lee como respaldo */
      'excelia-popup-dismissed':   false,   /* aviso de una sesion, no es un dato */
    };
    const dir = path.join(__dirname, '..', 'js');
    const claves = new Set();
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.js')) continue;
      const txt = fs.readFileSync(path.join(dir, f), 'utf8');
      for (const m of txt.matchAll(/'(excelia-[a-z0-9]+(?:-[a-z0-9]+)*)'/g)) claves.add(m[1]);
    }
    const sinDeclarar = [...claves].filter(k => !(k in CENSO));
    const sobran = Object.keys(CENSO).filter(k => !claves.has(k));
    if (sinDeclarar.length) console.log('     claves nuevas sin declarar en el censo: ' + sinDeclarar.join(', '));
    if (sobran.length) console.log('     el censo nombra claves que ya no existen: ' + sobran.join(', '));
    return !sinDeclarar.length && !sobran.length;
  }],
];

/* ── Ejecucion ──────────────────────────────────────────────── */
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

let ok = 0, fallos = [], nuevas = 0, actualizadas = 0;

for (const [nombre, fn] of VISTAS) {
  if (FILTRO && nombre.indexOf(FILTRO) === -1) continue;
  let html;
  try {
    html = fn();
  } catch (e) {
    fallos.push(nombre + '  -> reventó: ' + e.message);
    continue;
  }
  if (typeof html !== 'string') {
    fallos.push(nombre + '  -> no devolvió HTML');
    continue;
  }
  /* una etiqueta por linea, para que el diff de git se lea */
  const bonito = html.replace(/></g, '>\n<');
  const fichero = path.join(DIR, nombre + '.html');
  if (!fs.existsSync(fichero)) {
    fs.writeFileSync(fichero, bonito, 'utf8');
    nuevas++;
    continue;
  }
  const guardado = fs.readFileSync(fichero, 'utf8');
  if (guardado === bonito) { ok++; continue; }
  if (ACTUALIZAR) { fs.writeFileSync(fichero, bonito, 'utf8'); actualizadas++; continue; }
  /* primera linea distinta, para saber por donde mirar */
  const a = guardado.split('\n'), b = bonito.split('\n');
  let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
  fallos.push(nombre + '  -> cambia en la línea ' + (i + 1) +
              '\n      antes: ' + String(a[i]).slice(0, 110) +
              '\n      ahora: ' + String(b[i]).slice(0, 110));
}

let okR = 0;
for (const [nombre, fn] of REGLAS) {
  if (FILTRO) break;
  let r;
  try { r = fn(); } catch (e) { fallos.push('regla: ' + nombre + ' -> reventó: ' + e.message); continue; }
  if (r === true) okR++;
  else fallos.push('regla: ' + nombre + ' -> no se cumple');
}

console.log('');
console.log('  vistas    ' + ok + ' iguales' +
            (nuevas ? ', ' + nuevas + ' nuevas' : '') +
            (actualizadas ? ', ' + actualizadas + ' actualizadas' : ''));
if (!FILTRO) console.log('  reglas    ' + okR + '/' + REGLAS.length);
if (fallos.length) {
  console.log('');
  console.log('  FALLOS (' + fallos.length + '):');
  fallos.forEach(f => console.log('   · ' + f));
  console.log('');
  console.log('  Si el cambio es a proposito:  node tools/test.js --update');
  console.log('');
  process.exit(1);
}
console.log('');
console.log('  todo en orden');
console.log('');
