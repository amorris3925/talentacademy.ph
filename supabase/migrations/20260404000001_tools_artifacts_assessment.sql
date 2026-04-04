-- Academy Tools, Artifacts & Skill Assessment Schema
-- Supports: course-specific tools, learner artifacts with versioning, and invisible skill assessment

-- ─── Academy Tools Registry ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academy_tools (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL UNIQUE,
    display_name      TEXT NOT NULL,
    description       TEXT NOT NULL,
    handler           TEXT NOT NULL DEFAULT 'builtin',
    parameters_schema JSONB DEFAULT '{}',
    track_slugs       TEXT[] DEFAULT '{}',
    category          TEXT,
    icon              TEXT,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default tools per track
INSERT INTO academy_tools (name, display_name, description, handler, track_slugs, category, icon) VALUES
    -- AI Graphics tools
    ('generate_image', 'Image Generation', 'Generate an image from a text prompt using AI', 'builtin', '{graphic-design}', 'generation', 'Image'),
    ('analyze_style', 'Style Analysis', 'Analyze visual style, composition, and color theory of an image', 'builtin', '{graphic-design}', 'analysis', 'Eye'),
    ('extract_color_palette', 'Color Palette', 'Extract dominant color palette from an image', 'builtin', '{graphic-design}', 'analysis', 'Palette'),
    -- SEO/Writing tools
    ('analyze_seo', 'SEO Analysis', 'Analyze text content for SEO quality', 'builtin', '{foundation}', 'analysis', 'Search'),
    ('research_keywords', 'Keyword Research', 'Research and suggest keywords for a topic', 'builtin', '{foundation}', 'analysis', 'Key'),
    ('check_readability', 'Readability Check', 'Check text readability using standard metrics', 'builtin', '{foundation}', 'analysis', 'BookOpen'),
    -- Marketing tools
    ('build_campaign_brief', 'Campaign Brief', 'Generate a marketing campaign brief', 'builtin', '{marketing}', 'builder', 'Megaphone'),
    ('analyze_audience', 'Audience Analysis', 'Build an audience persona', 'builtin', '{marketing}', 'analysis', 'Users'),
    ('ab_copy_test', 'A/B Copy Test', 'Generate A/B copy variants for testing', 'builtin', '{marketing}', 'builder', 'Split'),
    -- Automations tools
    ('build_workflow', 'Workflow Builder', 'Design an automation workflow', 'builtin', '{operations}', 'builder', 'Workflow')
ON CONFLICT (name) DO NOTHING;


-- ─── Academy Artifacts ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academy_artifacts (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id         UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
    lesson_id          UUID,
    track_id           UUID,
    title              TEXT NOT NULL,
    slug               TEXT NOT NULL UNIQUE,
    artifact_type      VARCHAR(30) NOT NULL DEFAULT 'document',
    content_markdown   TEXT NOT NULL DEFAULT '',
    sections           JSONB,
    summary            TEXT,
    metadata           JSONB DEFAULT '{}',
    tags               TEXT[] DEFAULT '{}',
    status             VARCHAR(20) NOT NULL DEFAULT 'draft',
    is_public          BOOLEAN NOT NULL DEFAULT false,
    -- Assessment scores (AI-evaluated)
    quality_score      REAL,
    creativity_score   REAL,
    completeness_score REAL,
    skill_signals      JSONB DEFAULT '{}',
    evaluation_notes   TEXT,
    evaluated_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifacts_learner ON academy_artifacts(learner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_lesson ON academy_artifacts(lesson_id) WHERE lesson_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_artifacts_slug ON academy_artifacts(slug);
CREATE INDEX IF NOT EXISTS idx_artifacts_track ON academy_artifacts(track_id, status);


-- ─── Artifact Versions ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academy_artifact_versions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_id       UUID NOT NULL REFERENCES academy_artifacts(id) ON DELETE CASCADE,
    version_number    INT NOT NULL DEFAULT 1,
    title             TEXT,
    content_markdown  TEXT,
    sections          JSONB,
    summary           TEXT,
    snapshot_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_artifact_versions ON academy_artifact_versions(artifact_id, snapshot_at DESC);


-- ─── Skill Assessments ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academy_skill_assessments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id    UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
    lesson_id     UUID,
    artifact_id   UUID REFERENCES academy_artifacts(id) ON DELETE SET NULL,
    track_id      UUID,
    skill_domain  VARCHAR(50) NOT NULL,
    skill_name    VARCHAR(100) NOT NULL,
    score         REAL NOT NULL,
    evidence      JSONB DEFAULT '{}',
    source        VARCHAR(30) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_assessments_learner ON academy_skill_assessments(learner_id, skill_domain, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_track ON academy_skill_assessments(track_id, learner_id);


-- ─── Skill Profiles (aggregated) ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS academy_skill_profiles (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id       UUID NOT NULL REFERENCES academy_learners(id) ON DELETE CASCADE,
    track_id         UUID,
    skill_domain     VARCHAR(50) NOT NULL,
    skill_name       VARCHAR(100) NOT NULL,
    current_score    REAL NOT NULL DEFAULT 0,
    assessment_count INT NOT NULL DEFAULT 0,
    trend            VARCHAR(10) DEFAULT 'stable',
    last_assessed_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (learner_id, track_id, skill_domain, skill_name)
);


-- ─── Extend chat messages for tool tracking ────────────────────────────────

ALTER TABLE academy_chat_messages
    ADD COLUMN IF NOT EXISTS tools_used JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS structured_blocks JSONB DEFAULT '[]';


-- ─── Auto-update updated_at on artifacts ───────────────────────────────────

CREATE OR REPLACE FUNCTION update_artifact_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_artifact_updated_at ON academy_artifacts;
CREATE TRIGGER trg_artifact_updated_at
    BEFORE UPDATE ON academy_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION update_artifact_timestamp();
