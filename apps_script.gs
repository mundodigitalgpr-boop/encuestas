/**
 * Churrascos Chaca #5 — Backend de encuestas en Google Sheets
 * =============================================================
 * Conecta la encuesta (index.html) y el dashboard (dashboard.html)
 * con una hoja de cálculo de Google, GRATIS y sin servidor.
 *
 * Pestañas que usa (las crea `inicializar`):
 *   - "Encuestas"   → respuestas (una fila por encuesta).
 *   - "Config"      → TEXTOS editables (título, preguntas, mensajes...).
 *   - "Categorias"  → nombres de las categorías y si se muestran o no.
 *
 * Para cambiar textos o categorías NO hay que tocar código:
 * edita las celdas de las pestañas "Config" y "Categorias".
 */

var SHEET_NAME  = 'Encuestas';
var CONFIG_SHEET = 'Config';
var CAT_SHEET    = 'Categorias';

var ENCABEZADOS = [
  'created_at', 'nps',
  'csat_comida', 'csat_servicio', 'csat_ambiente', 'csat_limpieza', 'csat_precio',
  'comentario'
];

/* Textos por defecto: clave | valor | qué controla (solo edita la columna "valor") */
var CONFIG_DEFAULT = [
  ['titulo', '¿Cómo estuvo tu experiencia?', 'Título principal'],
  ['subtitulo', 'Te tomará menos de 1 minuto y nos ayuda muchísimo a mejorar.', 'Texto bajo el título'],
  ['pregunta_nps', '¿Qué tan probable es que nos recomiendes?', 'Pregunta del NPS'],
  ['ayuda_nps', '(0 = nada, 10 = totalmente)', 'Ayuda junto a la pregunta NPS'],
  ['nps_min', 'Nada probable', 'Etiqueta extremo izquierdo (0)'],
  ['nps_max', 'Muy probable', 'Etiqueta extremo derecho (10)'],
  ['pregunta_csat', 'Califica cada aspecto', 'Encabezado de las categorías'],
  ['ayuda_csat', '(toca las estrellas)', 'Ayuda de las categorías'],
  ['pregunta_comentario', '¿Algo más que quieras contarnos?', 'Pregunta del comentario'],
  ['placeholder_comentario', 'Escribe aquí tu comentario...', 'Texto gris dentro del comentario'],
  ['texto_boton', 'Enviar encuesta', 'Texto del botón de enviar'],
  ['gracias_titulo', '¡Muchas gracias!', 'Título de la pantalla final'],
  ['gracias_texto', 'Recibimos tu respuesta. Esperamos verte muy pronto de nuevo.', 'Texto de la pantalla final'],
  ['reaccion_0_3', 'Lamentamos que no fuera lo esperado. Cuéntanos abajo qué pasó.', 'Mensaje cuando el NPS es 0–3'],
  ['reaccion_4_6', 'Gracias por tu sinceridad. ¿Qué podríamos mejorar?', 'Mensaje cuando el NPS es 4–6'],
  ['reaccion_7_8', '¡Qué bueno! Nos esforzamos por darte aún más.', 'Mensaje cuando el NPS es 7–8'],
  ['reaccion_9_10', '¡Increíble! Nos encanta que la hayas pasado genial.', 'Mensaje cuando el NPS es 9–10'],
  ['estrella_1', 'Mal', 'Palabra para 1 estrella'],
  ['estrella_2', 'Regular', 'Palabra para 2 estrellas'],
  ['estrella_3', 'Bien', 'Palabra para 3 estrellas'],
  ['estrella_4', 'Muy bien', 'Palabra para 4 estrellas'],
  ['estrella_5', '¡Excelente!', 'Palabra para 5 estrellas']
];

/* Categorías: clave (no cambiar) | nombre (editable) | mostrar (SÍ/NO) */
var CAT_DEFAULT = [
  ['comida', 'Comida', 'SÍ'],
  ['servicio', 'Servicio', 'SÍ'],
  ['ambiente', 'Ambiente', 'SÍ'],
  ['limpieza', 'Limpieza', 'SÍ'],
  ['precio', 'Precio', 'SÍ']
];

/** Crea todas las pestañas y encabezados. Ejecútala UNA vez tras pegar el código. */
function inicializar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Encuestas
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(ENCABEZADOS);
    sh.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }

  // Config (textos)
  if (!ss.getSheetByName(CONFIG_SHEET)) {
    var cs = ss.insertSheet(CONFIG_SHEET);
    cs.appendRow(['clave', 'valor', 'qué controla']);
    cs.getRange(1, 1, 1, 3).setFontWeight('bold');
    cs.setFrozenRows(1);
    CONFIG_DEFAULT.forEach(function (r) { cs.appendRow(r); });
    cs.setColumnWidth(2, 380);
    cs.getRange('A:A').setFontColor('#999999'); // recordatorio: no cambiar la clave
  }

  // Categorias
  if (!ss.getSheetByName(CAT_SHEET)) {
    var cat = ss.insertSheet(CAT_SHEET);
    cat.appendRow(['clave', 'nombre', 'mostrar (SÍ/NO)']);
    cat.getRange(1, 1, 1, 3).setFontWeight('bold');
    cat.setFrozenRows(1);
    CAT_DEFAULT.forEach(function (r) { cat.appendRow(r); });
    cat.getRange('A:A').setFontColor('#999999');
  }

  return 'Listo: pestañas "Encuestas", "Config" y "Categorias" preparadas.';
}

/**
 * Importa las 7 respuestas históricas (migradas desde Supabase).
 * Ejecútala UNA vez, después de `inicializar`. Solo agrega el histórico
 * si la hoja "Encuestas" todavía no tiene respuestas (evita duplicados).
 */
var HISTORICO = [
  ['2026-06-17T13:12:29Z', 5,  5,4,4,4,2, ''],
  ['2026-06-17T13:18:42Z', 9,  4,4,5,5,5, 'Buen servicio'],
  ['2026-06-17T13:20:32Z', 10, 4,5,3,1,5, 'Ejemplo'],
  ['2026-06-17T13:24:22Z', 10, 5,4,2,5,5, ''],
  ['2026-06-17T14:10:18Z', 2,  2,2,2,2,2, '.'],
  ['2026-06-17T15:54:30Z', 10, 5,5,3,4,3, ''],
  ['2026-06-23T03:50:12Z', 10, 4,4,4,4,4, 'Son amables y amigables']
];

function importarHistorico() {
  var sh = _hoja();
  if (sh.getLastRow() > 1) {
    return 'La hoja ya tiene respuestas; no se importó el histórico (para evitar duplicados).';
  }
  HISTORICO.forEach(function (r) {
    sh.appendRow([new Date(r[0]), r[1], r[2], r[3], r[4], r[5], r[6], r[7]]);
  });
  return 'Importadas ' + HISTORICO.length + ' respuestas históricas.';
}

function _hoja() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { inicializar(); sh = ss.getSheetByName(SHEET_NAME); }
  return sh;
}

/** Recibe una encuesta (POST desde index.html) y la agrega como fila nueva. */
function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    _hoja().appendRow([
      new Date(),
      d.nps,
      d.csat_comida || '', d.csat_servicio || '', d.csat_ambiente || '',
      d.csat_limpieza || '', d.csat_precio || '',
      d.comentario || ''
    ]);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

/**
 * GET (vía JSONP):
 *   ?action=list    → todas las encuestas (para el dashboard)
 *   ?action=config  → textos y categorías (para la encuesta)
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var payload = (p.action === 'config') ? _leerConfig() : _leerEncuestas();
  var json = JSON.stringify(payload);
  if (p.callback) {
    return ContentService
      .createTextOutput(p.callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function _leerEncuestas() {
  var sh = _hoja();
  var valores = sh.getDataRange().getValues();
  var encabezados = valores.shift() || ENCABEZADOS;
  return valores.map(function (r) {
    var o = {};
    encabezados.forEach(function (h, i) {
      var v = r[i];
      o[h] = (v instanceof Date) ? v.toISOString() : v;
    });
    return o;
  });
}

function _leerConfig() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cfg = {};

  var cs = ss.getSheetByName(CONFIG_SHEET);
  if (cs) {
    cs.getDataRange().getValues().slice(1).forEach(function (r) {
      if (r[0] !== '' && r[0] != null) cfg[String(r[0]).trim()] = r[1];
    });
  }

  cfg.estrellas = ['',
    cfg.estrella_1 || 'Mal', cfg.estrella_2 || 'Regular', cfg.estrella_3 || 'Bien',
    cfg.estrella_4 || 'Muy bien', cfg.estrella_5 || '¡Excelente!'];

  var cats = [];
  var cat = ss.getSheetByName(CAT_SHEET);
  if (cat) {
    var si = ['sí', 'si', 'x', 'true', '1', 'yes'];
    cat.getDataRange().getValues().slice(1).forEach(function (r) {
      if (r[0] === '' || r[0] == null) return;
      cats.push({
        key: String(r[0]).trim(),
        nombre: r[1],
        activo: si.indexOf(String(r[2]).trim().toLowerCase()) >= 0
      });
    });
  }
  cfg.categorias = cats.length ? cats : null;
  return cfg;
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
