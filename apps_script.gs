/**
 * Churrascos Chaca #5 — Backend de encuestas en Google Sheets
 * =============================================================
 * Conecta la encuesta (index.html) y el dashboard (dashboard.html)
 * con una hoja de cálculo de Google, GRATIS y sin servidor.
 *
 * CÓMO INSTALAR (resumen — ver README.md para el detalle):
 *   1. Crea una Google Sheet nueva.
 *   2. Menú  Extensiones → Apps Script.
 *   3. Borra el contenido y pega TODO este archivo.
 *   4. Ejecuta una vez la función  inicializar  (crea la pestaña y encabezados)
 *      y autoriza los permisos.
 *   5. Implementar → Nueva implementación → Aplicación web:
 *        - Ejecutar como:  Yo
 *        - Quién tiene acceso:  Cualquier persona
 *      Copia la URL que termina en /exec y pégala en index.html y dashboard.html.
 */

var SHEET_NAME = 'Encuestas';
var ENCABEZADOS = [
  'created_at', 'nps',
  'csat_comida', 'csat_servicio', 'csat_ambiente', 'csat_limpieza', 'csat_precio',
  'comentario'
];

/** Crea la pestaña y los encabezados. Ejecútala UNA vez tras pegar el código. */
function inicializar() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(ENCABEZADOS);
    sh.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return 'Listo: pestaña "' + SHEET_NAME + '" preparada.';
}

/**
 * Importa las 7 respuestas históricas (migradas desde Supabase).
 * Ejecútala UNA vez, después de `inicializar`. Es segura: solo agrega
 * el histórico si la hoja todavía no tiene respuestas (evita duplicados).
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

/** Devuelve todas las encuestas (GET desde dashboard.html, vía JSONP). */
function doGet(e) {
  var sh = _hoja();
  var valores = sh.getDataRange().getValues();
  var encabezados = valores.shift() || ENCABEZADOS;
  var filas = valores.map(function (r) {
    var o = {};
    encabezados.forEach(function (h, i) {
      var v = r[i];
      // Fechas → ISO para que el dashboard las ordene/agrupe por día
      o[h] = (v instanceof Date) ? v.toISOString() : v;
    });
    return o;
  });

  var json = JSON.stringify(filas);
  var cb = e && e.parameter ? e.parameter.callback : null;
  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
