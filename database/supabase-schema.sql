-- ============================================================
-- ALTHAIA INNOVACIÓ — Schema per a Supabase (PostgreSQL)
-- Executa aquest fitxer a: Supabase → SQL Editor → New Query
-- ============================================================

-- ── Taula de projectes ────────────────────────────────────────────────────────
create table if not exists projects (
  id                   bigint primary key,            -- Date.now() generat per l'app
  title                text not null,
  description          text,
  service              text,
  owner_name           text,
  current_phase        integer not null default 1,
  status               text not null default 'active',
  priority             text not null default 'mitja',
  budget               numeric default 0,
  estimated_roi        numeric default 0,
  tags                 text[],
  ai_related           boolean default false,
  -- Matriu d'impacte (0-10)
  impact               jsonb,                          -- {clinical, economic, organizational, patient_exp}
  -- Dades del wizard (tots els camps del Manual Operatiu)
  wizard_activacio     jsonb,
  wizard_ideas         jsonb,
  wizard_selected      jsonb,
  wizard_experimental  jsonb,
  wizard_validacio     jsonb,
  wizard_dissenyFinal  jsonb,
  -- Validació SLL
  validation_score     numeric,
  dictamen             text,
  methodology          text,
  validation_types     text[],
  -- Criteris ENoLL
  enoll_criteria       jsonb,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

-- ── Taula de tasques ──────────────────────────────────────────────────────────
create table if not exists project_tasks (
  id           bigint primary key,
  project_id   bigint not null references projects(id) on delete cascade,
  title        text not null,
  description  text,
  status       text not null default 'pending',     -- pending | in_progress | completed
  priority     text default 'mitja',               -- alta | mitja | baixa
  due_date     text,                               -- YYYY-MM-DD (text per flexibilitat)
  assigned_to  text,
  created_at   timestamptz default now()
);

create index if not exists idx_tasks_project on project_tasks(project_id);

-- ── Taula d'events de timeline ────────────────────────────────────────────────
create table if not exists timeline_events (
  id           bigint primary key,
  project_id   bigint not null references projects(id) on delete cascade,
  title        text not null,
  date         text,                               -- YYYY-MM-DD
  type         text default 'milestone',           -- milestone | meeting | deliverable | note
  notes        text
);

create index if not exists idx_events_project on timeline_events(project_id);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Política permissiva (eina interna — la mateixa app controla l'autenticació)

alter table projects       enable row level security;
alter table project_tasks  enable row level security;
alter table timeline_events enable row level security;

drop policy if exists allow_all_projects on projects;
drop policy if exists allow_all_tasks    on project_tasks;
drop policy if exists allow_all_events   on timeline_events;

create policy allow_all_projects on projects        for all using (true) with check (true);
create policy allow_all_tasks    on project_tasks   for all using (true) with check (true);
create policy allow_all_events   on timeline_events for all using (true) with check (true);

-- ── Finalitzat ────────────────────────────────────────────────────────────────
-- Comprova que les taules s'han creat correctament:
-- select count(*) from projects;
-- select count(*) from project_tasks;
-- select count(*) from timeline_events;
