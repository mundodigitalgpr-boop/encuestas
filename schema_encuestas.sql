-- =====================================================================
-- Encuestas de satisfacción del restaurante
-- Proyecto Supabase: bmladupirmrzaqgmmsyd
-- =====================================================================
-- Mide:
--   * NPS        : 0–10  (¿recomendarías el restaurante?)
--   * CSAT       : 1–5 estrellas por categoría
--                  (comida, servicio, ambiente, limpieza, precio)
--   * Comentario : texto abierto opcional
-- =====================================================================

-- 1) Tabla principal --------------------------------------------------
create table if not exists public.encuestas (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),

  -- Net Promoter Score (0 a 10)
  nps            smallint not null check (nps between 0 and 10),

  -- CSAT por categoría (1 a 5 estrellas)
  csat_comida    smallint check (csat_comida    between 1 and 5),
  csat_servicio  smallint check (csat_servicio  between 1 and 5),
  csat_ambiente  smallint check (csat_ambiente  between 1 and 5),
  csat_limpieza  smallint check (csat_limpieza  between 1 and 5),
  csat_precio    smallint check (csat_precio    between 1 and 5),

  -- Comentario abierto (máx. 2000 caracteres)
  comentario     text check (char_length(comentario) <= 2000)
);

-- Índice para ordenar por fecha (dashboard / tendencia)
create index if not exists encuestas_created_at_idx
  on public.encuestas (created_at desc);

-- 2) Row Level Security ----------------------------------------------
alter table public.encuestas enable row level security;

-- Cualquiera (rol anónimo) puede ENVIAR una encuesta.
drop policy if exists "anon puede insertar encuestas" on public.encuestas;
create policy "anon puede insertar encuestas"
  on public.encuestas
  for insert
  to anon
  with check (true);

-- Cualquiera (rol anónimo) puede LEER las encuestas para el dashboard.
-- (No hay datos personales: solo puntuaciones y comentarios anónimos.)
drop policy if exists "anon puede leer encuestas" on public.encuestas;
create policy "anon puede leer encuestas"
  on public.encuestas
  for select
  to anon
  using (true);

-- NOTA: No se otorgan permisos de UPDATE ni DELETE al rol anónimo,
-- por lo que las respuestas no pueden modificarse ni borrarse con la
-- anon key. Para administrar registros usa el service_role o el panel
-- de Supabase.
