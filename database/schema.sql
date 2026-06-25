-- ============================================================
-- ALTHAIA INNOVACIÓ – Base de Dades Completa
-- PostgreSQL 15+
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ────────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'innovacio', 'clinic', 'gestor');
CREATE TYPE project_status AS ENUM ('active', 'paused', 'rejected', 'completed');
CREATE TYPE project_priority AS ENUM ('alta', 'mitja', 'baixa');
CREATE TYPE feedback_type AS ENUM ('clinical', 'patient', 'admin');
CREATE TYPE doc_type AS ENUM ('report', 'image', 'protocol', 'contract', 'other');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE ai_action_type AS ENUM (
  'generate_ideas', 'risk_detect', 'prioritize',
  'summarize', 'analyze_pilot', 'bottleneck'
);

-- ─── 1. SERVICES ──────────────────────────────────────────────────────────────

CREATE TABLE services (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  department  VARCHAR(100),
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. USERS ─────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  email        VARCHAR(200) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role         user_role NOT NULL DEFAULT 'clinic',
  service_id   INTEGER REFERENCES services(id) ON DELETE SET NULL,
  avatar       VARCHAR(10),
  active       BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email   ON users(email);
CREATE INDEX idx_users_role    ON users(role);
CREATE INDEX idx_users_service ON users(service_id);

-- ─── 3. PHASES ────────────────────────────────────────────────────────────────

CREATE TABLE phases (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(50) NOT NULL UNIQUE,
  order_index  SMALLINT NOT NULL UNIQUE CHECK (order_index BETWEEN 1 AND 8),
  icon         VARCHAR(10),
  description  TEXT,
  color        VARCHAR(30)
);

-- Seed data
INSERT INTO phases (name, order_index, icon, description, color) VALUES
  ('Detecció',       1, '🔍', 'Registre de necessitats clíniques', 'purple'),
  ('Generació',      2, '💡', 'Idees i propostes de solució',      'pink'),
  ('Selecció',       3, '🎯', 'Priorització i matriu de decisió',  'blue'),
  ('Disseny',        4, '📐', 'Definició detallada del projecte',  'teal'),
  ('Pilot',          5, '🧪', 'Prova pilot controlada',            'orange'),
  ('Avaluació',      6, '📊', 'Anàlisi de resultats del pilot',    'violet'),
  ('Implementació',  7, '🚀', 'Desplegament a l\'organització',    'amber'),
  ('Seguiment',      8, '📈', 'Monitoratge continu',               'sky');

-- ─── 4. PROJECTS ──────────────────────────────────────────────────────────────

CREATE TABLE projects (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  service_id      INTEGER REFERENCES services(id) ON DELETE SET NULL,
  owner_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  current_phase   SMALLINT NOT NULL DEFAULT 1 REFERENCES phases(order_index),
  status          project_status NOT NULL DEFAULT 'active',
  priority        project_priority NOT NULL DEFAULT 'mitja',
  budget          NUMERIC(12, 2) DEFAULT 0,
  estimated_roi   NUMERIC(12, 2) DEFAULT 0,
  tags            TEXT[],          -- Array de tags: ['IA', 'Cardiologia']
  ai_related      BOOLEAN DEFAULT FALSE,
  -- Impact scores (0–10)
  impact_clinical       NUMERIC(4,2) CHECK (impact_clinical BETWEEN 0 AND 10),
  impact_economic       NUMERIC(4,2) CHECK (impact_economic BETWEEN 0 AND 10),
  impact_organizational NUMERIC(4,2) CHECK (impact_organizational BETWEEN 0 AND 10),
  impact_patient_exp    NUMERIC(4,2) CHECK (impact_patient_exp BETWEEN 0 AND 10),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_owner   ON projects(owner_id);
CREATE INDEX idx_projects_service ON projects(service_id);
CREATE INDEX idx_projects_phase   ON projects(current_phase);
CREATE INDEX idx_projects_status  ON projects(status);
CREATE INDEX idx_projects_tags    ON projects USING GIN(tags);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 5. PROJECT TEAM (many-to-many) ──────────────────────────────────────────

CREATE TABLE project_team (
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role_in_project VARCHAR(100),
  joined_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- ─── 6. PROJECT PHASES HISTORY ────────────────────────────────────────────────

CREATE TABLE project_phases_history (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id    SMALLINT NOT NULL REFERENCES phases(order_index),
  entered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exited_at   TIMESTAMPTZ,
  notes       TEXT,
  changed_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  -- Computed: duration in hours (via view or application)
  CONSTRAINT one_active_phase UNIQUE (project_id, phase_id, entered_at)
);

CREATE INDEX idx_phase_history_project ON project_phases_history(project_id);
CREATE INDEX idx_phase_history_phase   ON project_phases_history(phase_id);

-- ─── 7. IDEAS ─────────────────────────────────────────────────────────────────

CREATE TABLE ideas (
  id              SERIAL PRIMARY KEY,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  pros            TEXT,
  cons            TEXT,
  estimated_cost  NUMERIC(12, 2),
  required_tech   TEXT,
  ai_related      BOOLEAN DEFAULT FALSE,
  created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ideas_project ON ideas(project_id);

-- ─── 8. IDEA EVALUATIONS (matriu de selecció) ─────────────────────────────────

CREATE TABLE idea_evaluations (
  id                      SERIAL PRIMARY KEY,
  idea_id                 INTEGER NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  evaluated_by            INTEGER REFERENCES users(id) ON DELETE SET NULL,
  clinical_impact_score   NUMERIC(4,2) CHECK (clinical_impact_score  BETWEEN 0 AND 10),
  economic_impact_score   NUMERIC(4,2) CHECK (economic_impact_score  BETWEEN 0 AND 10),
  feasibility_score       NUMERIC(4,2) CHECK (feasibility_score      BETWEEN 0 AND 10),
  resource_score          NUMERIC(4,2) CHECK (resource_score         BETWEEN 0 AND 10),
  time_score              NUMERIC(4,2) CHECK (time_score             BETWEEN 0 AND 10),
  innovation_score        NUMERIC(4,2) CHECK (innovation_score       BETWEEN 0 AND 10),
  strategy_score          NUMERIC(4,2) CHECK (strategy_score         BETWEEN 0 AND 10),
  -- Weighted total (computed):
  -- total = clinical*0.25 + economic*0.20 + feasibility*0.20 + resource*0.10
  --       + time*0.10 + innovation*0.10 + strategy*0.05
  total_score             NUMERIC(4,2) GENERATED ALWAYS AS (
    COALESCE(clinical_impact_score,0)*0.25 +
    COALESCE(economic_impact_score,0)*0.20 +
    COALESCE(feasibility_score,0)*0.20     +
    COALESCE(resource_score,0)*0.10        +
    COALESCE(time_score,0)*0.10            +
    COALESCE(innovation_score,0)*0.10      +
    COALESCE(strategy_score,0)*0.05
  ) STORED,
  notes                   TEXT,
  evaluated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evaluations_idea ON idea_evaluations(idea_id);

-- ─── 9. PROJECT DESIGNS ────────────────────────────────────────────────────────

CREATE TABLE project_designs (
  id              SERIAL PRIMARY KEY,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  objectives      TEXT,
  kpis            JSONB,    -- [{name, baseline, target, unit}]
  budget_detail   JSONB,    -- {personnel, tech, training, other}
  risks           JSONB,    -- [{description, probability, impact, mitigation}]
  partners        TEXT[],
  resources       TEXT,
  timeline        JSONB,    -- [{milestone, date}]
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_designs_updated_at
  BEFORE UPDATE ON project_designs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 10. PILOTS ────────────────────────────────────────────────────────────────

CREATE TABLE pilots (
  id                     SERIAL PRIMARY KEY,
  project_id             INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  location               VARCHAR(255),
  professionals_involved INTEGER DEFAULT 0,
  patients_involved      INTEGER DEFAULT 0,
  adoption_rate          NUMERIC(5,2) CHECK (adoption_rate BETWEEN 0 AND 100),
  satisfaction_score     NUMERIC(4,2) CHECK (satisfaction_score BETWEEN 0 AND 10),
  incidents              INTEGER DEFAULT 0,
  preliminary_results    TEXT,
  progress_pct           NUMERIC(5,2) CHECK (progress_pct BETWEEN 0 AND 100) DEFAULT 0,
  start_date             DATE,
  end_date               DATE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_pilots_updated_at
  BEFORE UPDATE ON pilots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 11. EVALUATION RESULTS ────────────────────────────────────────────────────

CREATE TABLE evaluation_results (
  id                       SERIAL PRIMARY KEY,
  project_id               INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  clinical_outcome         TEXT,
  economic_outcome         TEXT,
  patient_experience       NUMERIC(4,2) CHECK (patient_experience BETWEEN 0 AND 10),
  professional_satisfaction NUMERIC(4,2) CHECK (professional_satisfaction BETWEEN 0 AND 10),
  sustainability_score     NUMERIC(4,2) CHECK (sustainability_score BETWEEN 0 AND 10),
  social_return            TEXT,       -- SROI text/ratio
  qualitative_notes        TEXT,
  evaluated_at             TIMESTAMPTZ DEFAULT NOW(),
  evaluated_by             INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- ─── 12. IMPLEMENTATIONS ──────────────────────────────────────────────────────

CREATE TABLE implementations (
  id                    SERIAL PRIMARY KEY,
  project_id            INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  deployment_percentage NUMERIC(5,2) CHECK (deployment_percentage BETWEEN 0 AND 100) DEFAULT 0,
  centers_deployed      INTEGER DEFAULT 0,
  centers_total         INTEGER DEFAULT 0,
  training_status       VARCHAR(100),
  training_completion   NUMERIC(5,2) DEFAULT 0,
  incidents             INTEGER DEFAULT 0,
  timeline              JSONB,   -- [{milestone, date, status}]
  notes                 TEXT,
  go_live_date          DATE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_impl_updated_at
  BEFORE UPDATE ON implementations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 13. MONITORING (Seguiment) ───────────────────────────────────────────────

CREATE TABLE monitoring_records (
  id              SERIAL PRIMARY KEY,
  project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  kpi_name        VARCHAR(150) NOT NULL,
  kpi_value       NUMERIC,
  kpi_target      NUMERIC,
  kpi_unit        VARCHAR(50),
  notes           TEXT,
  recorded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_monitoring_project ON monitoring_records(project_id);
CREATE INDEX idx_monitoring_date    ON monitoring_records(recorded_at);

-- ─── 14. FEEDBACK ─────────────────────────────────────────────────────────────

CREATE TABLE feedback (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  type        feedback_type NOT NULL DEFAULT 'clinical',
  message     TEXT NOT NULL,
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  anonymous   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_project ON feedback(project_id);
CREATE INDEX idx_feedback_type    ON feedback(type);

-- ─── 15. DOCUMENTS ────────────────────────────────────────────────────────────

CREATE TABLE documents (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name     VARCHAR(255) NOT NULL,
  file_url      TEXT NOT NULL,
  file_size     INTEGER,    -- bytes
  mime_type     VARCHAR(100),
  type          doc_type NOT NULL DEFAULT 'other',
  version       VARCHAR(20) DEFAULT '1.0',
  description   TEXT,
  uploaded_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_project ON documents(project_id);

-- ─── 16. TASKS ────────────────────────────────────────────────────────────────

CREATE TABLE tasks (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  assigned_to  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status       task_status NOT NULL DEFAULT 'pending',
  priority     project_priority DEFAULT 'mitja',
  deadline     DATE,
  completed_at TIMESTAMPTZ,
  created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_project     ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status      ON tasks(status);
CREATE INDEX idx_tasks_deadline    ON tasks(deadline);

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 17. AI LOGS ──────────────────────────────────────────────────────────────

CREATE TABLE ai_logs (
  id           SERIAL PRIMARY KEY,
  project_id   INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  user_id      INTEGER REFERENCES users(id)    ON DELETE SET NULL,
  action_type  ai_action_type NOT NULL,
  model_used   VARCHAR(100),
  input_data   JSONB,
  output_data  JSONB,
  tokens_used  INTEGER,
  latency_ms   INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_logs_project ON ai_logs(project_id);
CREATE INDEX idx_ai_logs_action  ON ai_logs(action_type);

-- ─── VIEWS ────────────────────────────────────────────────────────────────────

-- Pipeline overview: projects per phase with key metrics
CREATE VIEW v_pipeline_summary AS
SELECT
  ph.order_index         AS phase_order,
  ph.name                AS phase_name,
  ph.icon                AS phase_icon,
  COUNT(p.id)            AS project_count,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END)    AS active_count,
  COUNT(CASE WHEN p.status = 'paused' THEN 1 END)    AS paused_count,
  AVG(p.estimated_roi)   AS avg_roi,
  SUM(p.estimated_roi)   AS total_roi
FROM phases ph
LEFT JOIN projects p ON p.current_phase = ph.order_index AND p.status <> 'rejected'
GROUP BY ph.order_index, ph.name, ph.icon
ORDER BY ph.order_index;

-- Phase duration stats
CREATE VIEW v_phase_duration_stats AS
SELECT
  ph.name                AS phase_name,
  ph.order_index,
  ROUND(AVG(
    EXTRACT(EPOCH FROM (COALESCE(pph.exited_at, NOW()) - pph.entered_at)) / 86400
  )::NUMERIC, 1)         AS avg_days,
  COUNT(pph.id)          AS transitions
FROM project_phases_history pph
JOIN phases ph ON ph.order_index = pph.phase_id
GROUP BY ph.name, ph.order_index
ORDER BY ph.order_index;

-- Project full detail view
CREATE VIEW v_project_detail AS
SELECT
  p.*,
  u.name            AS owner_name,
  u.email           AS owner_email,
  s.name            AS service_name,
  ph.name           AS phase_name,
  ph.icon           AS phase_icon,
  (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status <> 'completed')  AS pending_tasks,
  (SELECT COUNT(*) FROM feedback f WHERE f.project_id = p.id)                           AS feedback_count,
  (SELECT COUNT(*) FROM documents d WHERE d.project_id = p.id)                          AS document_count
FROM projects p
LEFT JOIN users    u  ON u.id           = p.owner_id
LEFT JOIN services s  ON s.id           = p.service_id
LEFT JOIN phases   ph ON ph.order_index = p.current_phase;

-- ─── INITIAL SEED DATA ────────────────────────────────────────────────────────

INSERT INTO services (name, department) VALUES
  ('Cardiologia',     'Medicina Interna'),
  ('Neurologia',      'Medicina Interna'),
  ('Oncologia',       'Medicina Interna'),
  ('Urgències',       'Serveis Generals'),
  ('UCI',             'Serveis Crítics'),
  ('Pediatria',       'Infantil'),
  ('Traumatologia',   'Cirurgia'),
  ('Cirurgia',        'Cirurgia'),
  ('Medicina Interna','Medicina Interna'),
  ('Radiologia',      'Diagnòstic per Imatge'),
  ('Farmàcia',        'Serveis Generals'),
  ('Infermeria',      'Cures'),
  ('Geriatria',       'Medicina Interna'),
  ('Salut Mental',    'Psiquiatria'),
  ('Gestió',          'Administració'),
  ('Innovació',       'Administració'),
  ('Tecnologia',      'Administració'),
  ('Qualitat',        'Administració');

-- ─── AUDIT LOG (opcional, bones pràctiques) ───────────────────────────────────

CREATE TABLE audit_log (
  id          BIGSERIAL PRIMARY KEY,
  table_name  VARCHAR(50) NOT NULL,
  record_id   INTEGER     NOT NULL,
  action      VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
  old_data    JSONB,
  new_data    JSONB,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_table    ON audit_log(table_name);
CREATE INDEX idx_audit_record   ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_user     ON audit_log(user_id);
CREATE INDEX idx_audit_date     ON audit_log(created_at);
