# 🍽️ Encuestas de Satisfacción para Restaurante

App web **gratuita** (HTML + JavaScript puro) para medir la satisfacción de tus clientes mediante un código QR. Sin backend propio, sin costos de servidor: usa **Supabase** (capa gratuita) para guardar las respuestas y **GitHub Pages** (gratis) para publicarla.

Mide:

- **NPS** (Net Promoter Score) — escala 0 a 10.
- **CSAT** por categoría con estrellas 1–5: **comida, servicio, ambiente, limpieza y precio**.
- **Comentario abierto** opcional.

## 📁 Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Encuesta del cliente, **mobile-first** para escanear desde un QR. |
| `dashboard.html` | Panel con gráficas (Chart.js): NPS, promedios CSAT, tendencia y comentarios. |
| `schema_encuestas.sql` | Tabla `encuestas` + políticas RLS para Supabase. |
| `README.md` | Este archivo. |

---

## 1️⃣ Configurar Supabase

> El proyecto ya está conectado a Supabase **`bmladupirmrzaqgmmsyd`** y la tabla `encuestas` **ya fue creada**. Esta sección sirve para replicarlo en otro proyecto o entenderlo.

1. Crea una cuenta gratuita en [supabase.com](https://supabase.com) y un proyecto nuevo.
2. En el panel, ve a **SQL Editor → New query**, pega el contenido de [`schema_encuestas.sql`](./schema_encuestas.sql) y ejecútalo (**Run**). Esto crea:
   - La tabla `public.encuestas` con validaciones (`nps` 0–10, CSAT 1–5).
   - **RLS activado** con dos políticas para el rol anónimo:
     - ✅ puede **insertar** (enviar encuestas),
     - ✅ puede **leer** (mostrar el dashboard),
     - ❌ **no** puede actualizar ni borrar.
3. Copia tus credenciales desde **Project Settings → API**:
   - **Project URL** → `https://bmladupirmrzaqgmmsyd.supabase.co`
   - **anon public key** (la `apikey` pública del cliente).
4. Pega esos valores en la parte superior del `<script>` de **`index.html`** y **`dashboard.html`**:

   ```js
   const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
   const SUPABASE_ANON_KEY = "TU_ANON_KEY";
   ```

   > 🔒 La **anon key es pública por diseño** y puede ir en el HTML. La seguridad la da el **RLS**: con esta llave solo se puede insertar y leer encuestas anónimas (sin datos personales), nunca tocar el resto de tus tablas.

---

## 2️⃣ Publicar en GitHub Pages (gratis)

1. Sube estos archivos a la **raíz** de tu repositorio en GitHub (ya hecho con el commit a `main`).
2. En GitHub: **Settings → Pages**.
3. En **Build and deployment → Source**, elige **Deploy from a branch**.
4. Selecciona la rama **`main`** y la carpeta **`/ (root)`**, y pulsa **Save**.
5. Espera ~1 minuto. Tu encuesta quedará disponible en:

   ```
   https://<tu-usuario>.github.io/<tu-repo>/index.html
   ```

   Y el panel en:

   ```
   https://<tu-usuario>.github.io/<tu-repo>/dashboard.html
   ```

> Para este repo: **`https://mundodigitalgpr-boop.github.io/encuestas/`**

---

## 3️⃣ Generar el código QR

1. Copia la URL de tu **encuesta** (`.../index.html`).
2. Genera un QR gratis en cualquier generador, por ejemplo:
   - [qr-code-generator.com](https://www.qr-code-generator.com)
   - [qrcode.tec-it.com](https://qrcode.tec-it.com)
   - O en Google: busca *"crear código QR"*.
3. Descarga el QR e imprímelo en **mesas, tickets, mostrador o vitrina**.
4. El cliente escanea con la cámara → abre la encuesta → responde en menos de 1 minuto. 🎉

> 💡 Consejo: añade un texto como *"Escanea y cuéntanos cómo te fue 🍽️"* junto al QR para subir la tasa de respuesta.

---

## 📊 Cómo se calcula el NPS

- **Promotores**: respuestas 9–10
- **Pasivos**: respuestas 7–8
- **Detractores**: respuestas 0–6

**NPS = % Promotores − % Detractores**

Rango de −100 a +100. El dashboard lo etiqueta como **Crítico** (< 0), **Aceptable** (0–49) o **Excelente** (≥ 50).

---

## ❓ Solución de problemas

| Problema | Solución |
|---|---|
| La encuesta no envía | Verifica `SUPABASE_URL` y `SUPABASE_ANON_KEY`; abre la consola del navegador (F12) para ver el error. |
| Dashboard sin datos | Asegúrate de haber enviado al menos una encuesta y de que la política de **lectura (select)** del RLS esté activa. |
| Error 401 / 403 | Revisa que las políticas RLS de `schema_encuestas.sql` se hayan ejecutado correctamente. |
| GitHub Pages no aparece | Confirma que Pages apunta a la rama `main` y carpeta `/root`; espera 1–2 minutos tras guardar. |

---

Hecho con ❤️ usando HTML, [Chart.js](https://www.chartjs.org) y [Supabase](https://supabase.com).
