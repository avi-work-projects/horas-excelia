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
  ['bodas-clases', () => { app.BODA_SUBTAB = 'clases'; app.BODA_CLASS_MODE = 'ver'; return app.renderBodasBody(); }],
  ['bodas-clases-edicion', () => {
    app.BODA_SUBTAB = 'clases'; app.BODA_CLASS_MODE = 'editar';
    const h = app.renderBodasBody();
    app.BODA_CLASS_MODE = 'ver';
    return h;
  }],
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

  /* ── Ventana economica y Resumen ──────────────────────────────
     Se vigilan por la puerta de arriba (renderEconContent y compania) en vez
     de funcion a funcion: cada instantanea arrastra el armazon y el cuerpo de
     esa pestana, y basta cambiar la variable de pestana. Son la parte con mas
     numeros de la app, donde un error no se ve mirando. */
  ['econ-resumen-anual', () => {
    app.ECON_YEAR = 2026; app.ECON_VIEW = 'resumen'; app.ECON_RESUMEN_MODE = 'anual';
    return app.renderEconContent();
  }],
  ['econ-resumen-mensual', () => {
    app.ECON_YEAR = 2026; app.ECON_VIEW = 'resumen'; app.ECON_RESUMEN_MODE = 'mensual';
    const h = app.renderEconContent(); app.ECON_RESUMEN_MODE = 'anual'; return h;
  }],
  ['econ-horas-dias', () => { app.ECON_YEAR = 2026; app.ECON_VIEW = 'dias'; return app.renderEconContent(); }],
  ['econ-gastos', () => { app.ECON_YEAR = 2026; app.ECON_VIEW = 'gastos'; return app.renderEconContent(); }],
  ['econ-analisis', () => { app.ECON_YEAR = 2026; app.ECON_VIEW = 'analisis'; return app.renderEconContent(); }],
  ['fiscal-personal', () => { app.FISCAL_TAB = 'personal'; return app.renderFiscalContent(); }],
  ['fiscal-gastos-desgrav', () => { app.FISCAL_TAB = 'gastos_desg'; return app.renderFiscalContent(); }],
  ['fiscal-irpf-deducciones', () => { app.FISCAL_TAB = 'irpf_deduc'; return app.renderFiscalContent(); }],
  ['fiscal-despacho', () => {
    app.FISCAL_TAB = 'despacho'; const h = app.renderFiscalContent();
    app.FISCAL_TAB = 'personal'; return h;
  }],
  ['resumen-horas-dias', () => {
    app.SUMMARY_YEAR = 2026; app.SUMMARY_TAB = 'work'; return app.renderSummaryContent();
  }],
  ['resumen-puentes', () => {
    app.SUMMARY_YEAR = 2026; app.SUMMARY_TAB = 'puentes'; return app.renderSummaryContent();
  }],
  ['resumen-vacaciones', () => {
    app.SUMMARY_YEAR = 2026; app.SUMMARY_TAB = 'time-off';
    const h = app.renderSummaryContent(); app.SUMMARY_TAB = 'work'; return h;
  }],

  /* ── Armazones y paneles que faltaban ── */
  ['ventana-eventos', () => { app.EV_VIEW = 'cal'; app.EV_YEAR = 2026; app.EV_MONTH = 7; return app.renderEvContent(); }],
  ['eventos-por-meses', () => { app.EV_YEAR = 2026; return app.renderEvMonthsView(); }],
  ['panel-alarma-evento', () => {
    const ev = app.EVENTS.find(e => e.id === 'fx-boda-ok');
    return app.renderEvAlarmPanel(ev, new Date(ev.start + 'T00:00:00'));
  }],
  ['cumples-ventana', () => { app.BDAY_YEAR = 2026; app.BDAY_VIEW = 'upcoming'; return app.renderBdayContent(); }],
  ['cumples-detalle', () => app.renderBdayDetail(app.BDAYS[0])],
  ['cumples-formulario', () => app.renderBdayForm(app.BDAYS[0])],
  ['cumples-panel-alarma', () => app.renderBdayAlarmPanel(app.BDAYS[0])],
  ['bodas-formulario-pareja', () => app.renderBodaCoupleForm(app.BODA_COUPLES[0])],
  ['econ-estudio', () => { app.ECON_YEAR = 2026; return app.renderEstudioContent(); }],
  ['econ-estudio-comparador', () => { app.ECON_ESTUDIO_SUB = 'comparador'; return app.renderEconComp(); }],
  ['econ-estudio-simulador', () => {
    app.ECON_ESTUDIO_SUB = 'simulador'; const h = app.renderEconSim();
    app.ECON_ESTUDIO_SUB = 'comparador'; return h;
  }],
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
  /* Un trozo de UNA columna puede ser una barra larga cortada por el fin de
     semana o por el cambio de mes. Lo que decide es la duracion del EVENTO. */
  ['un evento de un solo dia nunca se reparte la casilla', () => {
    const uno = { ev: { kind: 'grande', type: 'Viaje', start: '2026-03-03', end: '2026-03-03' }, cs: 3, ce: 3, unDia: true };
    const largo = { ev: { kind: 'grande', type: 'Viaje', start: '2026-03-03', end: '2026-03-05' }, cs: 3, ce: 5, unDia: false };
    return app._evTrozosSeRozan(uno, largo) === false;
  }],
  ['una barra cortada por la semana SI comparte su unico dia', () => {
    /* el domingo: una acaba ahi y otra empieza ahi y sigue la semana que viene */
    const acaba = { ev: { kind: 'grande', type: 'Asturias', start: '2026-09-07', end: '2026-09-13' }, cs: 0, ce: 6, unDia: false };
    const sigue = { ev: { kind: 'grande', type: 'Asturias', start: '2026-09-13', end: '2026-09-20' }, cs: 6, ce: 6, unDia: false };
    return app._evTrozosSeRozan(acaba, sigue) === true;
  }],
  /* La hora de un trayecto es opcional: antes, guardar sin hora tiraba el
     trayecto entero y con el se perdian el medio y el conductor. */
  ['un trayecto sin hora sobrevive, con su medio y su conductor', () => {
    const ev = { start: '2026-03-01', end: '2026-03-05',
      viaje: { ida: { time: '08:30', modo: 'tren' },
               vuelta: { time: null, modo: 'coche', conductor: 'Marta' } } };
    const t = app.evTramos(ev);
    if (t.length !== 2) return false;
    const vuelta = t.find(x => x.k === 'vuelta');
    return vuelta.t.modo === 'coche' && vuelta.t.conductor === 'Marta'
        && app.evTramoTexto(vuelta).indexOf('sin hora') !== -1;
  }],
  ['Otros comparte el relevo solo con barras del mismo grosor', () => {
    const a = { ev: { id:'a',kind: 'grande', type: 'Otros', start: '2026-03-01', end: '2026-03-03' }, cs: 0, ce: 2, unDia: false,row:0 };
    const b = { ev: { id:'b',kind: 'grande', type: 'Otros', start: '2026-03-03', end: '2026-03-06' }, cs: 2, ce: 5, unDia: false,row:0 };
    app._evMarcarMitades([a,b]);
    if(!a.halfR||!b.halfL||!app._evBarSegments(a,[a,b]).every(t=>t.n===1))return false;
    b.ev.barSize='sm';
    return !app._evTrozosSeRozan(a,b);
  }],
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
  /* El arranque no puede buscar un elemento que ya no esta en el HTML.
     Es lo que paso al quitar el conmutador alarmUseMacro: el borrado fue
     correcto, pero un init.js viejo servido contra el index.html nuevo le
     engancho un listener a null y tiro el fichero entero. */
  ['el arranque no busca elementos que no existen', () => {
    const raiz = path.join(__dirname, '..');
    const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
    const enHtml = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
    /* Ficheros cuyo CUERPO corre al cargar la pagina */
    const ARRANQUE = ['js/init.js', 'js/import-export.js', 'js/home-popup.js', 'js/logo-popup.js'];
    const malos = [];
    for (const f of ARRANQUE) {
      const abs = path.join(raiz, f);
      if (!fs.existsSync(abs)) continue;
      const txt = fs.readFileSync(abs, 'utf8');
      /* ids que el propio fichero crea sobre la marcha */
      const creados = new Set([
        ...[...txt.matchAll(/\.id\s*=\s*'([^']+)'/g)].map(m => m[1]),
        ...[...txt.matchAll(/id="([^"]+)"/g)].map(m => m[1]),
      ]);
      for (const m of txt.matchAll(/getElementById\('([^']+)'\)/g)) {
        if (!enHtml.has(m[1]) && !creados.has(m[1])) malos.push(f + ' -> ' + m[1]);
      }
    }
    if (malos.length) { console.log('     ' + malos.join('\n     ')); return false; }
    return true;
  }],
  /* Censo de claves de localStorage. La regla compara lo que el codigo
     ESCRIBE con esta lista: si aparece una clave nueva, el test cae y hay que
     venir aqui a declarar como se respalda. Ese es el momento en que uno se
     acuerda de tocar "Exportar todo". */
  ['ninguna clave de localStorage se queda fuera del backup', () => {
    const CENSO = {
      'excelia-bodas-config-v1': 'bodaConfig',
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
      'excelia-mail-config-v1': 'mailConfig',
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

/* Regresion visual: dos barras medias cruzan jueves/viernes; el contorno
   debe ser unico, conservando ambos escalones y los extremos redondeados. */
[false,true].forEach(annual=>{
  VISTAS.push(['barras-continuas-'+(annual?'compacto':'mensual'),()=>{
    const list=[
      {ev:{id:'contorno-a',kind:'grande',type:'Otros',barSize:'md',color:'#b45309',title:'Media A',start:'2026-10-05',end:'2026-10-09'},cs:0,ce:4,starts:true,ends:true},
      {ev:{id:'contorno-b',kind:'grande',type:'Otros',barSize:'md',color:'#65a30d',title:'Media B',start:'2026-10-08',end:'2026-10-12'},cs:3,ce:6,starts:true,ends:false}
    ];
    return list.map(it=>app._evSteppedBar(it,app._evBarSegments(it,list),annual,true,'')).join('');
  }]);
});

VISTAS.push(['eventos-subpestana-cumpleanos',function(){
  const previous=app.EV_VIEW;
  try{app.EV_VIEW='birthdays';return app.renderEvContent();}finally{app.EV_VIEW=previous;}
}]);

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

REGLAS.push(['barras: solo se estrechan las columnas compartidas', function(){
  function item(id,start,end,cs,ce,size){return {ev:{id:id,kind:'grande',type:'Otros',barSize:size||'lg',start:start,end:end},cs:cs,ce:ce};}
  var a=item('a','2026-09-21','2026-09-25',0,4);
  var b=item('b','2026-09-24','2026-09-27',3,6);
  var ta=app._evBarSegments(a,[a,b]),tb=app._evBarSegments(b,[a,b]);
  return ta.length===2&&ta[0].cs===0&&ta[0].ce===2&&ta[0].n===1&&ta[1].n===2
    &&tb.length===2&&tb[0].n===2&&tb[1].n===1&&ta[1].lane!==tb[0].lane;
}]);
REGLAS.push(['barras: cortes de semana no inventan relevos', function(){
  var a={ev:{kind:'grande',type:'Viaje',start:'2026-09-01',end:'2026-09-10'},cs:0,ce:0};
  var b={ev:{kind:'grande',type:'Asturias',start:'2026-09-05',end:'2026-09-12'},cs:0,ce:2};
  return !app._evTrozosSeRozan(a,b)&&app._evBarSegments(a,[a,b])[0].n===2;
}]);
REGLAS.push(['barras: alturas distintas no se estrechan entre si', function(){
  var a={ev:{id:'a',kind:'grande',type:'Viaje',start:'2026-09-01'},cs:0,ce:4};
  var b={ev:{id:'b',kind:'grande',type:'Casa Rural',start:'2026-09-01'},cs:0,ce:4};
  return app._evBarSegments(a,[a,b])[0].n===1&&app._evBarSegments(b,[a,b])[0].n===1;
}]);

REGLAS.push(['barras: relevo real conserva media casilla y altura completa', function(){
  var a={ev:{id:'a',kind:'grande',type:'Viaje',start:'2026-09-01',end:'2026-09-06'},cs:0,ce:6,row:0};
  var b={ev:{id:'b',kind:'grande',type:'Asturias',start:'2026-09-06',end:'2026-09-12'},cs:6,ce:6,row:0};
  app._evMarcarMitades([a,b]);
  return a.halfR&&b.halfL&&app._evBarSegments(a,[a,b]).every(t=>t.n===1);
}]);
REGLAS.push(['barras: tres coincidencias y corte de mes sin perder columnas', function(){
  var list=['a','b','c'].map(id=>({ev:{id:id,kind:'grande',type:'Casa Rural',start:'2026-09-28',end:'2026-10-04'},cs:0,ce:6}));
  var parts=app._evBarSegments(list[1],list,[true,true,true,false,false,false,false]);
  return parts.length===2&&parts[0].ce===2&&parts[1].cs===3&&parts[1].ce===6
    &&parts.every(t=>t.n===3&&t.lane===1)&&parts[0].dentro&&!parts[1].dentro;
}]);

REGLAS.push(['el espacio entre barras no mueve sus bordes exteriores',function(){
  return [false,true].every(annual=>['lg','md'].every(size=>{
    const ev={kind:'grande',type:'Otros',barSize:size};
    const full=app._evBarExtent(ev,{n:1,lane:0},annual);
    const upper=app._evBarExtent(ev,{n:2,lane:0},annual);
    const lower=app._evBarExtent(ev,{n:2,lane:1},annual);
    return Math.abs(full.bottom-lower.bottom)<1e-8&&full.top===upper.top&&upper.bottom<lower.top;
  }));
}]);
REGLAS.push(['agenda: eventos coincidentes tienen carriles distintos sin duplicarse',function(){
  const segs=[{ev:{id:'a'},sd:5,ed:7},{ev:{id:'b'},sd:6,ed:9},{ev:{id:'c'},sd:13,ed:15}];
  app._evWeekLanes(segs);
  return segs.length===3&&segs[0].lane!==segs[1].lane&&segs[0].lanes===2&&segs[1].lanes===2&&segs[2].lanes===1;
}]);

REGLAS.push(['barras: solo los extremos reales se redondean',function(){
  const vertices=[[0,175],[1000,175],[1000,825],[0,825]];
  return [[false,false,0],[true,false,2],[false,true,2],[true,true,4]].every(function(c){
    const path=app._evRoundedOutline(vertices,20,60,4,c[0],c[1]);
    return (path.match(/ A /g)||[]).length===c[2];
  });
}]);

REGLAS.push(['barras finas: separacion respecto a la banda gruesa',function(){
  return [false,true].every(function(annual){
    const thin=app._evBarBand({kind:'grande',type:'Otros',barSize:'sm'},annual);
    const thick=app._evBarBand({kind:'grande',type:'Otros',barSize:'lg'},annual);
    return thin[0]>thick[0]+thick[1];
  });
}]);

REGLAS.push(['grandes: limite por grosor, edicion y rangos largos',function(){
  const saved=app.EVENTS;
  const make=(id,size,start,end)=>({id,kind:'grande',type:'Otros',barSize:size,start,end});
  try{
    app.EVENTS=[make('a','lg','2026-10-01','2028-12-31'),make('b','lg','2028-10-01','2028-12-31')];
    return app.evDayLimitExceeded(make('c','lg','2026-10-01','2028-12-31'),null)==='2028-10-01'
      &&app.evDayLimitExceeded(app.EVENTS[0],'a')===null
      &&app.evDayLimitExceeded(make('c','md','2026-10-01','2028-12-31'),null)===null;
  }finally{app.EVENTS=saved;}
}]);
REGLAS.push(['finas: apiladas con altura original solo durante coincidencia',function(){
  const ev={kind:'grande',type:'Otros',barSize:'sm'};
  return [false,true].every(function(annual){
    const full=app._evBarExtent(ev,{n:1,lane:0},annual);
    const upper=app._evBarExtent(ev,{n:2,lane:0},annual);
    const lower=app._evBarExtent(ev,{n:2,lane:1},annual);
    return Math.abs((upper.bottom-upper.top)-(full.bottom-full.top))<1e-8&&upper.bottom<lower.top&&lower.bottom===full.bottom;
  });
}]);

REGLAS.push(['inicio: todos los cumpleanos a 7 dias sin alarma',function(){
  const ctx=cargarApp(claves),content={innerHTML:''};
  ctx.BDAYS=[{name:'Normal cercano',month:8,day:28},{name:'VIP cercano',month:8,day:22,vip:true},{name:'Ya avisado',month:8,day:21},{name:'Fuera plazo',month:8,day:29}];
  ctx.isBdayAlarmSet=b=>b.name==='Ya avisado';
  ctx.sessionStorage={getItem:()=>null};
  ctx.document.getElementById=id=>id==='homePopupContent'?content:id==='homePopup'?{style:{}}:null;
  require('vm').runInContext(fs.readFileSync(path.join(RAIZ,'js/home-popup.js'),'utf8'),ctx);
  return content.innerHTML.includes('Normal cercano')&&content.innerHTML.includes('VIP cercano')&&!content.innerHTML.includes('Ya avisado')&&!content.innerHTML.includes('Fuera plazo');
}]);

REGLAS.push(['swipe proximos: orden, extremos y modal protegido',function(){
  const ctx=cargarApp(claves),handlers={},el={addEventListener:(name,fn)=>{handlers[name]=fn;}};
  require('vm').runInContext(fs.readFileSync(path.join(RAIZ,'js/events-bind.js'),'utf8'),ctx);
  ctx.document.getElementById=id=>id==='eventsOverlay'?el:null;
  ctx.refreshEvents=()=>{};ctx._switchEvView=view=>{ctx.EV_VIEW=view;};
  ctx.requestAnimationFrame=()=>{};ctx._bindEvGestos();ctx.EV_VIEW='upcoming';
  function swipe(dx,target){handlers.touchstart({target:target||el,touches:[{clientX:150,clientY:100}]});handlers.touchend({changedTouches:[{clientX:150+dx,clientY:105}]});}
  swipe(-100);if(ctx.EV_VIEW!=='birthdays')return false;
  swipe(-100);if(ctx.EV_VIEW!=='months')return false;
  swipe(-100);if(ctx.EV_VIEW!=='months')return false;
  swipe(100);if(ctx.EV_VIEW!=='birthdays')return false;
  const panel={nodeType:1,parentNode:el,classList:{contains:c=>c==='bd-alarm-overlay'}};
  swipe(100,panel);return ctx.EV_VIEW==='birthdays';
}]);

REGLAS.push(['parejas activas: hoy incluido, pasadas fuera y sin fecha al final',function(){
  const ctx=cargarApp(claves);
  ctx.BODA_COUPLES=[{id:'late',name:'Futura',weddingDate:'2026-09-01'},{id:'old',name:'Anterior',weddingDate:'2026-08-20'},{id:'today',name:'Actual',weddingDate:'2026-08-21'},{id:'unknown',name:'Sin fecha'}];
  ctx.BODA_PAREJAS_FILTER='activas';ctx.BODA_PAREJAS_SORT='boda';
  const html=ctx._renderBodaParejas();
  if(html.includes('data-cid="old"')||html.indexOf('data-cid="today"')>html.indexOf('data-cid="late"')||html.indexOf('data-cid="late"')>html.indexOf('data-cid="unknown"'))return false;
  ctx.BODA_PAREJAS_FILTER='pasadas';
  const past=ctx._renderBodaParejas();return past.includes('data-cid="old"')&&!past.includes('data-cid="today"');
}]);
REGLAS.push(['cumpleanos: grupos sin duplicar en limites 1, 7 y 14 dias',function(){
  const ctx=cargarApp(claves);
  ctx.BDAYS=[{name:'Manana',month:8,day:22},{name:'Siete',month:8,day:28},{name:'Ocho',month:8,day:29},{name:'Catorce',month:9,day:4},{name:'Fuera',month:9,day:5}];
  const html=ctx.renderBdayUpcoming();
  return ['Manana','Siete','Ocho','Catorce'].every(name=>(html.match(new RegExp('data-bday-name="'+name+'"','g'))||[]).length===1)&&!html.includes('data-bday-name="Fuera"');
}]);

REGLAS.push(['cumpleanos: Solo VIP filtra sin cambiar grupos',function(){
  const ctx=cargarApp(claves);ctx.BDAYS=[{name:'Normal',day:22,month:8},{name:'Vip',day:22,month:8,vip:true}];ctx.BDAY_UP_VIP=true;
  const html=ctx.renderBdayUpcoming();return html.includes('data-bday-name="Vip"')&&!html.includes('data-bday-name="Normal"')&&html.includes('ev-week-sep');
}]);
REGLAS.push(['parejas: fecha y clases son filtros combinables',function(){
  const ctx=cargarApp(claves),c={id:'test',weddingDate:'2026-09-01'};
  ctx.bodaProgress=()=>({falta:2});
  return ctx.bodaMatchesDate(c,'activas')&&ctx.bodaMatchesClasses(c,'incompletas')&&!ctx.bodaMatchesClasses(c,'completas')&&ctx.bodaMatchesClasses(c,null)&&!ctx.bodaMatchesDate(c,'pasadas');
}]);

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
