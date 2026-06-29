# 🍽️ Encuestas de Satisfacción — Churrascos Chaca #5

App web **gratuita** (HTML + JavaScript puro) para medir la satisfacción de tus clientes mediante un código QR. Sin backend propio y sin costos: guarda las respuestas en una **Google Sheet** (vía Google Apps Script) y se publica en **Netlify** o **GitHub Pages** (gratis).

Mide:

- **NPS** (Net Promoter Score) — escala 0 a 10.
- **ISC** (Índice de Satisfacción del Cliente) por categoría con estrellas 1–5: **comida, servicio, ambiente, limpieza y precio**.
- **Comentario abierto** opcional.

## 📁 Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Encuesta del cliente, **mobile-first**, con la imagen corporativa (negro + dorado). |
| `dashboard.html` | Panel con gráficas (Chart.js): NPS, promedios ISC, tendencia y comentarios. |
| `apps_script.gs` | Código de Google Apps Script que conecta la app con tu Google Sheet. |
| `generar_qr.py` | Genera el póster QR corporativo con el logo embebido. |
| `logo.jpg` | Logo de Churrascos Chaca #5. |
| `schema_encuestas.sql` | *(Opcional / legado)* Esquema para Supabase, por si prefieres esa base. |

---

## 1️⃣ Configurar Google Sheets (Apps Script)

1. Crea una **Google Sheet** nueva en [sheets.new](https://sheets.new).
2. Menú **Extensiones → Apps Script**.
3. Borra el código de ejemplo y **pega todo el contenido de [`apps_script.gs`](./apps_script.gs)**.
4. Arriba, selecciona la función **`inicializar`** y pulsa **Ejecutar** ▶. Autoriza los permisos cuando te lo pida (es tu propia hoja). Esto crea la pestaña **Encuestas** con los encabezados.
5. Pulsa **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**.
   - **Ejecutar como:** *Yo*.
   - **Quién tiene acceso:** *Cualquier persona*.
   - **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
6. Pega esa URL en **`index.html`** y **`dashboard.html`**, en la línea:

   ```js
   const APPS_SCRIPT_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT/exec";
   ```

> 🔒 La hoja y el script son **tuyos**. La app solo agrega filas (encuesta) y lee filas (dashboard). No se exponen credenciales de ningún otro sistema.

> ⚠️ **Cada vez que cambies el código del script**, vuelve a **Implementar → Gestionar implementaciones → editar (lápiz) → Versión: Nueva → Implementar** para que los cambios surtan efecto. La URL `/exec` se mantiene.

---

## 2️⃣ Publicar la app (Netlify Drop — gratis y sin Git)

1. Sube `index.html`, `dashboard.html` y `logo.jpg` a [app.netlify.com/drop](https://app.netlify.com/drop) (arrástralos).
2. Netlify te da una URL como `https://chaca5.netlify.app`.
3. Para actualizar: entra a tu sitio → pestaña **Deploys** → arrastra los archivos de nuevo. **La URL no cambia**, así que tu QR sigue sirviendo.

- **Encuesta (para el QR):** `https://chaca5.netlify.app/`
- **Dashboard:** `https://chaca5.netlify.app/dashboard.html`

> *Alternativa:* también puedes usar **GitHub Pages** (Settings → Pages → rama `main` → `/root`).

---

## 3️⃣ Generar el código QR corporativo

Con Python (requiere `pip install "qrcode[pil]" pillow`):

```bash
python3 generar_qr.py "https://chaca5.netlify.app/"
```

Genera:
- `qr_chaca.png` → póster completo (negro + marco dorado + logo + texto), listo para imprimir.
- `qr_chaca_simple.png` → solo el QR con el logo (para tickets o redes).

Imprímelo a un tamaño mínimo de **8 × 8 cm** y pruébalo con tu celular antes de colocarlo en las mesas.

---

## ✏️ Editar textos y categorías SIN tocar código

Todo el texto visible y las categorías se controlan desde **dos pestañas de tu Google Sheet** (las crea `inicializar`):

### Pestaña **Config** — textos
Columnas: **clave** (no la cambies) · **valor** (esto editas) · **qué controla**.

Puedes cambiar, por ejemplo:
- `titulo`, `subtitulo`, `pregunta_nps`, `pregunta_csat`, `texto_boton`
- los 4 mensajes de reacción del NPS (`reaccion_0_3`, `reaccion_4_6`, `reaccion_7_8`, `reaccion_9_10`)
- las palabras de las estrellas (`estrella_1` … `estrella_5`)
- el texto de la pantalla de agradecimiento (`gracias_titulo`, `gracias_texto`)

### Pestaña **Categorias** — qué se evalúa
Columnas: **clave** (no la cambies) · **nombre** (editable) · **mostrar (SÍ/NO)**.

- Cambia **nombre** para renombrar una categoría (p. ej. *Precio* → *Relación precio/calidad*).
- Pon **NO** en *mostrar* para ocultar una categoría de la encuesta.

> Los cambios se reflejan **al recargar** la encuesta y el dashboard. No hay que volver a desplegar ni subir archivos: la app lee la configuración en vivo desde la hoja.

> 💡 Las **claves** (`comida`, `servicio`, …) corresponden a las columnas donde se guardan las notas. Por eso solo se editan el *nombre* y el *mostrar*; añadir una categoría totalmente nueva sí requiere un pequeño ajuste de código (puedo ayudarte).

---

## 📊 Cómo se calcula el NPS y el ISC

**NPS** (a partir de la pregunta 0–10):
- **Promotores**: 9–10 · **Pasivos**: 7–8 · **Detractores**: 0–6
- NPS clásico = `% Promotores − % Detractores` (rango −100 a +100).
- El dashboard lo muestra en **escala 0–100** = `(NPS_clásico + 100) / 2`, para que nunca sea negativo.

**ISC** (Índice de Satisfacción del Cliente, a partir de las estrellas 1–5):
- Promedio de las categorías activas. En el dashboard también se expresa como **% = (ISC / 5) × 100**.

**Bandas estrictas y recomendaciones** (aplican a NPS 0–100 y a ISC %):

| Nota | Valoración | Recomendación |
|---|---|---|
| **91–100** | Excelente | Buen trabajo, mantener el nivel. |
| **86–90** | Bueno | Reforzar la cultura de servicio con el personal. |
| **0–85** | Por mejorar | Trabajar planes de acción (el ISC señala además la categoría más baja). |

---

## ❓ Solución de problemas

| Problema | Solución |
|---|---|
| La encuesta no guarda | Verifica que `APPS_SCRIPT_URL` termine en `/exec` y que la implementación tenga acceso *"Cualquier persona"*. |
| Dashboard sin datos | Confirma que ejecutaste `inicializar` y que la URL de Apps Script es la correcta. Abre la consola del navegador (F12) para ver errores. |
| Cambié el script y no se refleja | Crea una **nueva versión** de la implementación (ver nota ⚠️ en la sección 1). |
| Quiero ver las respuestas crudas | Ábrelas directamente en la pestaña **Encuestas** de tu Google Sheet. |

---

Hecho con ❤️ usando HTML, [Chart.js](https://www.chartjs.org) y [Google Apps Script](https://developers.google.com/apps-script).
