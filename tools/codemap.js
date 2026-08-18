/* ============================================================
   CODEMAP — genera CODEMAP.md, un índice de símbolos del proyecto
   Uso:  node tools/codemap.js
   Objetivo: poder localizar cualquier función/estado/bloque CSS con un
   grep sobre un único fichero pequeño, en vez de leer ficheros de 2000
   líneas enteros. Regenerarlo tras cambios grandes.
   ============================================================ */
var fs = require('fs');
var path = require('path');
var ROOT = path.join(__dirname, '..');

function read(f){ return fs.readFileSync(path.join(ROOT, f), 'utf8').split(/\r?\n/); }
function list(dir, ext){
  return fs.readdirSync(path.join(ROOT, dir))
    .filter(function(f){ return f.endsWith(ext); })
    .sort()
    .map(function(f){ return dir + '/' + f; });
}

/* ── JS: funciones y variables globales en MAYÚSCULAS ──
   Las funciones de primer nivel llevan tambien su tamano aproximado; las que
   pasan de LARGA_MIN lineas se marcan con (!) porque suelen ser candidatas a
   partirse o a compartirse con otra vista. */
var LARGA_MIN = 80;
function scanJs(file){
  var lines = read(file), fns = [], vars = [], tops = [];
  lines.forEach(function(l, i){
    var n = i + 1;
    var mf = l.match(/^function\s+([A-Za-z_$][\w$]*)\s*\(/);
    if (mf) tops.push({ name: mf[1], line: n });
    var mf2 = l.match(/^\s*function\s+([A-Za-z_$][\w$]*)\s*\(/);
    if (mf2){ fns.push({ name: mf2[1], line: n, top: !!mf }); return; }
    var ma = l.match(/^\s*(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*function\s*\(/);
    if (ma){ fns.push({ name: ma[1], line: n, top: false }); return; }
    var mv = l.match(/^\s*(?:var|let|const)\s+([A-Z][A-Z0-9_]{2,})\s*=/);
    if (mv) vars.push(mv[1] + ':' + n);
  });
  /* Tamano de cada funcion de primer nivel = hasta la siguiente o el final */
  var size = {};
  tops.forEach(function(t, k){
    var end = (k + 1 < tops.length) ? tops[k + 1].line : lines.length;
    size[t.name + ':' + t.line] = end - t.line;
  });
  var out = fns.map(function(f){
    var key = f.name + ':' + f.line;
    var sz = f.top ? size[key] : 0;
    return key + (sz >= LARGA_MIN ? ' (!' + sz + ')' : '');
  });
  return { file: file, lines: lines.length, fns: out, vars: vars };
}

/* ── CSS: cabeceras de sección + rangos por prefijo de clase ── */
function scanCss(file){
  var lines = read(file), sections = [], prefixes = {};
  lines.forEach(function(l, i){
    var n = i + 1;
    var ms = l.match(/^\s*\/\*+\s*(?:[─=-]*\s*)?(.+?)\s*(?:[─=-]*)\s*\*\/\s*$/);
    if (ms && ms[1].length > 3 && !/^\s*$/.test(ms[1])) sections.push(ms[1].replace(/\s+/g,' ') + ':' + n);
    /* prefijo = primeras 2 palabras del primer selector de clase de la línea */
    var mc = l.match(/^\s*\.([a-z0-9]+(?:-[a-z0-9]+)?)/i);
    if (mc){
      var p = '.' + mc[1];
      if (!prefixes[p]) prefixes[p] = [n, n];
      else prefixes[p][1] = n;
    }
  });
  return { file: file, lines: lines.length, sections: sections, prefixes: prefixes };
}

var out = [];
out.push('# CODEMAP — índice de símbolos');
out.push('');
out.push('> Generado por `node tools/codemap.js`. **Regenerar tras cambios grandes.**');
out.push('> Formato: `nombre:línea`. Para leer solo lo necesario: localiza el símbolo aquí');
out.push('> con grep y abre ese fichero con `offset`/`limit` alrededor de la línea.');
out.push('');

out.push('## JavaScript');
out.push('');
list('js', '.js').forEach(function(f){
  var s = scanJs(f);
  out.push('### ' + s.file + '  _(' + s.lines + ' líneas)_');
  if (s.vars.length){ out.push('**Estado global:** ' + s.vars.join(' · ')); out.push(''); }
  if (s.fns.length){ out.push('**Funciones:** ' + s.fns.join(' · ')); out.push(''); }
});

out.push('## CSS');
out.push('');
['css/styles.css'].forEach(function(f){
  var s = scanCss(f);
  out.push('### ' + s.file + '  _(' + s.lines + ' líneas)_');
  out.push('');
  out.push('**Secciones:**');
  out.push('');
  s.sections.forEach(function(x){ out.push('- ' + x); });
  out.push('');
  out.push('**Rangos por prefijo de clase:** ');
  var keys = Object.keys(s.prefixes).sort();
  out.push(keys.map(function(k){ var r = s.prefixes[k]; return k + ':' + r[0] + '-' + r[1]; }).join(' · '));
  out.push('');
});

fs.writeFileSync(path.join(ROOT, 'CODEMAP.md'), out.join('\n') + '\n', 'utf8');
console.log('CODEMAP.md generado (' + out.length + ' líneas)');
