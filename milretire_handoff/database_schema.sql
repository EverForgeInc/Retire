-- PostgreSQL schema for Military Retirement App
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE member_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  rank TEXT,
  branch TEXT NOT NULL DEFAULT 'USAF',
  component TEXT NOT NULL DEFAULT 'Active Duty',
  installation TEXT,
  timezone TEXT,
  projected_retirement_date DATE NOT NULL,
  skillbridge_start DATE,
  skillbridge_end DATE,
  terminal_leave_start DATE,
  final_duty_day DATE,
  retirement_location TEXT,
  overseas_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch TEXT,
  component TEXT,
  version TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  external_key TEXT UNIQUE NOT NULL,
  section_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  owner_label TEXT,
  evidence_label TEXT,
  required_level TEXT NOT NULL DEFAULT 'verify_locally',
  date_rule JSONB NOT NULL,
  dependencies JSONB NOT NULL DEFAULT '[]',
  official_source JSONB,
  local_override_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE member_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_profile_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  task_template_id UUID REFERENCES task_templates(id),
  title TEXT NOT NULL,
  category TEXT,
  owner_label TEXT,
  calculated_start DATE,
  calculated_end DATE,
  manual_due_date DATE,
  date_override BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES users(id),
  date_completed DATE,
  notes TEXT,
  required_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('not_started','in_progress','waiting','complete','not_applicable'))
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_task_id UUID REFERENCES member_tasks(id) ON DELETE CASCADE,
  member_profile_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  sha256 TEXT,
  document_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_task_id UUID NOT NULL REFERENCES member_tasks(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  member_profile_id UUID REFERENCES member_profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_value JSONB,
  after_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_member_tasks_profile ON member_tasks(member_profile_id);
CREATE INDEX idx_member_tasks_dates ON member_tasks(calculated_start, calculated_end);
CREATE INDEX idx_reminders_due ON reminders(remind_at, status);
CREATE INDEX idx_audit_profile ON audit_events(member_profile_id, created_at);

CREATE TABLE transition_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_profile_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  projected_retirement_date DATE NOT NULL,
  current_leave_balance NUMERIC(6,2),
  leave_accrual_per_month NUMERIC(5,2) DEFAULT 2.5,
  maximum_skillbridge_days INTEGER,
  policy_combination_limit_days INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID NOT NULL REFERENCES transition_scenarios(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  chargeable_leave BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  source TEXT,
  CONSTRAINT valid_event_dates CHECK (end_date >= start_date)
);

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city TEXT NOT NULL,
  region TEXT,
  country TEXT NOT NULL,
  currency CHAR(3) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE location_cost_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  effective_date DATE NOT NULL,
  category TEXT NOT NULL,
  amount_local NUMERIC(12,2),
  amount_usd NUMERIC(12,2),
  source_type TEXT,
  source_url TEXT,
  source_date DATE,
  last_verified DATE,
  exchange_rate NUMERIC(16,8),
  exchange_rate_date DATE,
  confidence TEXT,
  approved BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE income_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_profile_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  retirement_system TEXT,
  high3_monthly NUMERIC(12,2),
  years_service NUMERIC(5,2),
  multiplier NUMERIC(7,5),
  estimated_retired_pay NUMERIC(12,2),
  member_va_rating INTEGER,
  member_va_pay NUMERIC(12,2),
  spouse_va_pay NUMERIC(12,2),
  civilian_income NUMERIC(12,2),
  other_income NUMERIC(12,2),
  dependent_configuration JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scenario_location_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  income_scenario_id UUID NOT NULL REFERENCES income_scenarios(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  custom_expenses JSONB NOT NULL DEFAULT '{}',
  weights JSONB NOT NULL DEFAULT '{}',
  UNIQUE(income_scenario_id, location_id)
);

CREATE TABLE benefit_rate_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  benefit_type TEXT NOT NULL,
  effective_date DATE NOT NULL,
  source_url TEXT NOT NULL,
  source_hash TEXT,
  status TEXT NOT NULL DEFAULT 'staged',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id)
);

CREATE TABLE va_compensation_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES benefit_rate_versions(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  dependent_key TEXT NOT NULL,
  monthly_amount NUMERIC(12,2) NOT NULL,
  additional_child_under18 NUMERIC(12,2),
  additional_child_school NUMERIC(12,2),
  spouse_aid_attendance NUMERIC(12,2),
  UNIQUE(version_id, rating, dependent_key)
);

CREATE TABLE military_pay_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES benefit_rate_versions(id) ON DELETE CASCADE,
  pay_grade TEXT NOT NULL,
  years_service_band TEXT NOT NULL,
  monthly_basic_pay NUMERIC(12,2) NOT NULL,
  UNIQUE(version_id, pay_grade, years_service_band)
);


-- Privacy-preserving evidence references. Medical files remain outside the app by default.
CREATE TABLE evidence_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_profile_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  member_task_id UUID REFERENCES member_tasks(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  record_category TEXT,
  facility_or_office TEXT,
  request_date DATE,
  received_date DATE,
  completeness TEXT,
  confirmation_number TEXT,
  summary TEXT,
  external_storage_label TEXT,
  sensitive_health_metadata BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_completeness CHECK (completeness IS NULL OR completeness IN ('not_requested','requested','partial','complete','missing'))
);

CREATE TABLE va_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_profile_id UUID NOT NULL REFERENCES member_profiles(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  body_system TEXT,
  diagnosis_status TEXT,
  onset_or_service_event TEXT,
  symptoms TEXT,
  flare_ups TEXT,
  functional_impact_narrative TEXT,
  treatment_history TEXT,
  claim_status TEXT,
  exam_status TEXT,
  decision_rating NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE va_functional_limitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  va_condition_id UUID NOT NULL REFERENCES va_conditions(id) ON DELETE CASCADE,
  activity TEXT NOT NULL,
  limitation_description TEXT NOT NULL,
  threshold_value NUMERIC(12,2),
  threshold_unit TEXT,
  frequency TEXT,
  severity TEXT,
  flare_impact TEXT,
  accommodation_or_device TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE digest_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cadence TEXT NOT NULL DEFAULT 'off',
  delivery_local_time TIME NOT NULL DEFAULT '08:00',
  weekly_day SMALLINT,
  timezone TEXT NOT NULL,
  include_active_phase BOOLEAN NOT NULL DEFAULT TRUE,
  include_overdue BOOLEAN NOT NULL DEFAULT TRUE,
  include_waiting BOOLEAN NOT NULL DEFAULT FALSE,
  upcoming_days INTEGER NOT NULL DEFAULT 7,
  send_empty_digest BOOLEAN NOT NULL DEFAULT FALSE,
  paused_until TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_digest_cadence CHECK (cadence IN ('off','daily','weekly')),
  CONSTRAINT valid_weekly_day CHECK (weekly_day IS NULL OR weekly_day BETWEEN 0 AND 6),
  CONSTRAINT weekly_day_required CHECK (cadence <> 'weekly' OR weekly_day IS NOT NULL)
);

CREATE TABLE digest_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_period_key TEXT NOT NULL,
  cadence TEXT NOT NULL,
  task_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  error_code TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scheduled_period_key)
);

CREATE INDEX idx_evidence_profile ON evidence_references(member_profile_id);
CREATE INDEX idx_va_conditions_profile ON va_conditions(member_profile_id);
CREATE INDEX idx_digest_due ON digest_preferences(cadence, unsubscribed_at, paused_until);
