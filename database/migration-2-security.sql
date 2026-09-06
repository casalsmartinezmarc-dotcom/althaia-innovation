-- ============================================================
-- ALTHAIA INNOVACIÓ — Migració 2: Banc d'idees + tancament RLS
-- Executa aquest fitxer a: Supabase → SQL Editor → New Query
--
-- IMPORTANT — ordre d'aplicació:
--   1. Afegeix primer la variable d'entorn SUPABASE_SERVICE_ROLE_KEY
--      a Vercel (Settings → Environment Variables) i torna a desplegar.
--   2. Comprova que crear/editar/eliminar projectes segueix funcionant
--      a la web (ara passa per /api/db amb la service role key).
--   3. NOMÉS DESPRÉS, executa aquest SQL. Si l'executes abans del
--      pas 1, les escriptures directes des del navegador deixaran de
--      funcionar fins que afegeixis la variable.
-- ============================================================

-- ── Comptes professionals (abans només a localStorage, no sincronitzaven) ──────
-- Cap policy per a anon/authenticated: NOMÉS el backend (service role, que
-- salta la RLS) hi pot llegir o escriure — mai el navegador directament.
-- Així els password_hash no són mai visibles amb la clau anon.
create table if not exists app_users (
  id             text primary key,
  name           text not null,
  email          text not null unique,
  password_hash  text not null,
  role           text not null default 'professional',   -- admin | professional
  service        text,
  active         boolean default true,
  created_at     text
);

alter table app_users enable row level security;
-- (deliberadament sense cap "create policy" — RLS activat i 0 policies = accés denegat per defecte)

-- ── Dades reals de Pilot i Avaluació (abans només existien com a demo) ─────────
alter table projects add column if not exists pilot_data      jsonb;
alter table projects add column if not exists evaluation_data jsonb;

-- ── Taula de Feedback (abans només existia com a demo) ─────────────────────────
create table if not exists project_feedback (
  id          bigint primary key,
  project_id  bigint not null references projects(id) on delete cascade,
  type        text default 'clinical',   -- clinical | patient | admin
  message     text not null,
  created_at  text
);
create index if not exists idx_feedback_project on project_feedback(project_id);

alter table project_feedback enable row level security;
drop policy if exists select_feedback on project_feedback;
create policy select_feedback on project_feedback for select using (true);

-- ── Taula del Banc d'Idees ─────────────────────────────────────────────────────
create table if not exists ideas_bank (
  id                bigint primary key,
  title             text not null,
  description       text,
  origin            text,
  submitter         text,
  service           text,
  status            text default 'pendent',
  screening_result  text,
  screening_notes   text,
  screening_date     text,
  priority_level    text,
  priority_notes    text,
  priority_date     text,
  created_at        text
);

alter table ideas_bank enable row level security;
drop policy if exists allow_all_ideas  on ideas_bank;
drop policy if exists select_ideas     on ideas_bank;
create policy select_ideas on ideas_bank for select using (true);

-- ── Tanquem l'accés d'escriptura directa (anon) a totes les taules ───────────
-- Les escriptures (insert/update/delete) ara passen per /api/db, que fa
-- servir la service role key — aquesta clau salta la RLS automàticament,
-- per això no li cal cap policy pròpia. Només deixem SELECT per a anon.

drop policy if exists allow_all_projects on projects;
drop policy if exists select_projects    on projects;
create policy select_projects on projects for select using (true);

drop policy if exists allow_all_tasks on project_tasks;
drop policy if exists select_tasks    on project_tasks;
create policy select_tasks on project_tasks for select using (true);

drop policy if exists allow_all_events on timeline_events;
drop policy if exists select_events    on timeline_events;
create policy select_events on timeline_events for select using (true);

-- ── Comprovació ────────────────────────────────────────────────────────────────
-- select count(*) from ideas_bank;
-- Un INSERT directe amb la clau anon ha de fallar (RLS) després d'això.
-- Prova-ho des de Configuració → "Test d'escriptura a Supabase" a la web:
-- aquell test fa servir la clau anon i HA de fallar ara (és el comportament esperat).
