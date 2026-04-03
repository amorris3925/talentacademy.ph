-- ============================================================================
-- Analytics & Tracking Tables
-- Comprehensive session, event, quiz attempt, chat, and evaluation tracking.
-- ============================================================================

-- ─── Sessions ──────────────────────────────────────────────────────────────
-- Each login creates a session that expires after 24 hours.
-- Summary counters are updated by Henry API as events come in.

CREATE TABLE academy_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id    UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
  ended_at      TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  -- Device / environment
  user_agent    TEXT,
  ip_address    INET,
  country       VARCHAR(2),
  city          VARCHAR(100),
  device_type   VARCHAR(20),  -- 'mobile', 'tablet', 'desktop'
  browser       VARCHAR(50),
  os            VARCHAR(50),
  -- Session summary (updated incrementally)
  total_events      INTEGER NOT NULL DEFAULT 0,
  lessons_viewed    INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  quizzes_attempted INTEGER NOT NULL DEFAULT 0,
  chat_messages_sent INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_learner_active ON academy_sessions(learner_id, is_active);
CREATE INDEX idx_sessions_expires ON academy_sessions(expires_at) WHERE is_active = true;

-- ─── Events ───────────────────────────────────���────────────────────────────
-- Generic event log for all user interactions. Batched inserts from frontend.
-- If TimescaleDB is available, this is converted to a hypertable below.

CREATE TABLE academy_events (
  id            UUID DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES academy_sessions(id) ON DELETE CASCADE,
  learner_id    UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  event_type    VARCHAR(50) NOT NULL,
  lesson_id     UUID,
  module_id     UUID,
  track_id      UUID,
  metadata      JSONB NOT NULL DEFAULT '{}',
  client_ts     TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Try to convert to hypertable for automatic time-based partitioning.
-- Falls back gracefully if TimescaleDB is not enabled.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
    PERFORM create_hypertable('academy_events', 'created_at', migrate_data => true);
  ELSE
    -- Add a standard primary key if not a hypertable
    ALTER TABLE academy_events ADD PRIMARY KEY (id);
  END IF;
END
$$;

CREATE INDEX idx_events_session ON academy_events(session_id, created_at DESC);
CREATE INDEX idx_events_learner_type ON academy_events(learner_id, event_type, created_at DESC);
CREATE INDEX idx_events_lesson ON academy_events(lesson_id, created_at DESC) WHERE lesson_id IS NOT NULL;

-- ─── Quiz Attempts ─────────────────────────────────────────────────────────
-- Per-question, per-attempt data. Normalizes what was previously JSONB.

CREATE TABLE academy_quiz_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID NOT NULL REFERENCES academy_sessions(id) ON DELETE CASCADE,
  learner_id        UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  lesson_id         UUID NOT NULL,
  block_index       INTEGER NOT NULL,
  question_text     TEXT NOT NULL,
  options           JSONB NOT NULL,
  correct_index     INTEGER NOT NULL,
  selected_index    INTEGER NOT NULL,
  selected_answer   TEXT NOT NULL,
  reasoning         TEXT NOT NULL,
  is_correct        BOOLEAN NOT NULL,
  attempt_number    INTEGER NOT NULL DEFAULT 1,
  time_to_answer_ms    INTEGER,       -- ms from quiz display to answer selection
  time_to_reasoning_ms INTEGER,       -- ms from answer selection to submit
  answer_changed    BOOLEAN NOT NULL DEFAULT false,
  -- LLM-computed scores (populated async by backend)
  reasoning_score      REAL,          -- 0.0 to 1.0
  reasoning_analysis   JSONB,         -- { causal, connection, depth, originality, flags }
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_learner_lesson ON academy_quiz_attempts(learner_id, lesson_id);
CREATE INDEX idx_quiz_session ON academy_quiz_attempts(session_id);

-- ─── Chat Messages (persisted) ─────────────────────────────────────────────
-- Replaces the ephemeral client-side chat. Every message is now saved.

CREATE TABLE academy_chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES academy_sessions(id) ON DELETE CASCADE,
  learner_id    UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  lesson_id     UUID,
  role          VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
  content       TEXT NOT NULL,
  source        VARCHAR(30) DEFAULT 'typed',  -- typed, prompt_chip, highlight_ask, quiz_feedback, checkpoint
  rating        SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_session ON academy_chat_messages(session_id, created_at);
CREATE INDEX idx_chat_learner_lesson ON academy_chat_messages(learner_id, lesson_id, created_at);

-- ─── Block Views ───────────────────────────────────────────────────────────
-- Tracks how long each content block was visible in the viewport.

CREATE TABLE academy_block_views (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES academy_sessions(id) ON DELETE CASCADE,
  learner_id      UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL,
  block_index     INTEGER NOT NULL,
  block_type      VARCHAR(30) NOT NULL,
  time_visible_ms INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_block_views_session_lesson ON academy_block_views(session_id, lesson_id);

-- ─── Evaluation Scores (7-dimension rolling) ──────────────────────────────
-- One row per learner per day. Updated after each lesson completion.

CREATE TABLE academy_evaluation_scores (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id                  UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  evaluation_date             DATE NOT NULL,
  analytical_reasoning        REAL NOT NULL DEFAULT 0,
  engagement_depth            REAL NOT NULL DEFAULT 0,
  management_aptitude         REAL NOT NULL DEFAULT 0,
  self_direction              REAL NOT NULL DEFAULT 0,
  consistency                 REAL NOT NULL DEFAULT 0,
  growth_trajectory           REAL NOT NULL DEFAULT 0,
  communication_quality       REAL NOT NULL DEFAULT 0,
  composite_talent_score      REAL NOT NULL DEFAULT 0,
  composite_management_score  REAL NOT NULL DEFAULT 0,
  score_breakdown             JSONB DEFAULT '{}',
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (learner_id, evaluation_date)
);

-- ─── Evaluation Snapshots (historical) ─────────────────────────────────────
-- Point-in-time records for growth trajectory analysis and cohort comparison.

CREATE TABLE academy_evaluation_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id      UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
  snapshot_type   VARCHAR(30) NOT NULL,  -- weekly, module_complete, track_complete
  trigger_id      UUID,                  -- module_id or track_id that triggered it
  scores          JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_learner ON academy_evaluation_snapshots(learner_id, created_at DESC);

-- ─── pg_cron: Hourly session expiry ────────────────────────────────────────
-- Deactivates sessions that have passed their 24-hour expiry.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'expire-stale-sessions',
      '0 * * * *',
      $$UPDATE academy_sessions SET is_active = false, ended_at = expires_at WHERE is_active = true AND expires_at < now()$$
    );
  END IF;
END
$$;

-- ─── pg_cron: Daily raw event cleanup (keep 90 days) ──────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-old-events',
      '0 3 * * *',
      $$DELETE FROM academy_events WHERE created_at < now() - INTERVAL '90 days'$$
    );
  END IF;
END
$$;
