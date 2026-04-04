-- ============================================================================
-- Feedback System Tables (consolidated from agency OS migrations v127+v129+v135+v155)
-- Purpose: Support comprehensive feedback/bug reporting with two-way chat
-- ============================================================================

-- 1. Sequence for human-readable ticket numbers
CREATE SEQUENCE IF NOT EXISTS feedback_ticket_number_seq START 1001;

-- 2. Feedback Tickets Table
CREATE TABLE IF NOT EXISTS feedback_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User information
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_display_name TEXT NOT NULL,

    -- Ticket metadata
    ticket_number INTEGER NOT NULL UNIQUE DEFAULT nextval('feedback_ticket_number_seq'),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'not_relevant')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT CHECK (category IN ('bug', 'feature_request', 'question', 'other')),

    -- Issue details
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Context capture (JSONB for flexibility)
    page_url TEXT NOT NULL,
    page_path TEXT,
    context_data JSONB DEFAULT '{}',

    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMPTZ,

    -- Resolution
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    -- AI Analysis
    ai_problem_diagnosis TEXT,
    ai_recommended_fix TEXT,
    ai_analysis_model VARCHAR(50),
    ai_analyzed_at TIMESTAMPTZ,

    -- Tracking
    unread_by_user BOOLEAN DEFAULT FALSE,
    unread_by_admin BOOLEAN DEFAULT TRUE,
    last_message_at TIMESTAMPTZ,
    message_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_user_id
    ON feedback_tickets(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_tickets_status
    ON feedback_tickets(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_tickets_assigned_to
    ON feedback_tickets(assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_feedback_tickets_unread_admin
    ON feedback_tickets(unread_by_admin, created_at DESC)
    WHERE unread_by_admin = TRUE;

-- 3. Feedback Messages Table (Two-way chat)
CREATE TABLE IF NOT EXISTS feedback_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ticket_id UUID NOT NULL REFERENCES feedback_tickets(id) ON DELETE CASCADE,

    -- Message author
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_display_name TEXT NOT NULL,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,

    -- Message content
    message TEXT NOT NULL,

    -- Metadata
    is_internal_note BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_messages_ticket_id
    ON feedback_messages(ticket_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_feedback_messages_user_id
    ON feedback_messages(user_id, created_at DESC);

-- 4. Feedback Attachments Table (Screenshots, files)
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ticket_id UUID REFERENCES feedback_tickets(id) ON DELETE CASCADE,
    message_id UUID REFERENCES feedback_messages(id) ON DELETE CASCADE,

    CHECK ((ticket_id IS NOT NULL AND message_id IS NULL) OR
           (ticket_id IS NULL AND message_id IS NOT NULL)),

    -- File information
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT NOT NULL,

    -- Uploaded by
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_by_email TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_attachments_ticket_id
    ON feedback_attachments(ticket_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_attachments_message_id
    ON feedback_attachments(message_id, created_at DESC);

-- ============================================================================
-- Helper Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION update_feedback_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feedback_tickets
    SET updated_at = NOW(),
        last_message_at = NOW(),
        message_count = message_count + 1,
        unread_by_user = CASE WHEN NEW.is_staff THEN TRUE ELSE unread_by_user END,
        unread_by_admin = CASE WHEN NOT NEW.is_staff THEN TRUE ELSE unread_by_admin END
    WHERE id = NEW.ticket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ticket_on_message ON feedback_messages;
CREATE TRIGGER trg_update_ticket_on_message
    AFTER INSERT ON feedback_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_ticket_timestamp();

CREATE OR REPLACE FUNCTION get_user_feedback_tickets(p_user_id UUID)
RETURNS TABLE (
    ticket_id UUID,
    title TEXT,
    status TEXT,
    priority TEXT,
    category TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    message_count INTEGER,
    unread_by_user BOOLEAN,
    last_message_preview TEXT,
    attachment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.category,
        t.created_at,
        t.updated_at,
        t.message_count,
        t.unread_by_user,
        (SELECT m.message FROM feedback_messages m
         WHERE m.ticket_id = t.id
         ORDER BY m.created_at DESC LIMIT 1) as last_message_preview,
        (SELECT COUNT(*) FROM feedback_attachments a
         WHERE a.ticket_id = t.id) as attachment_count
    FROM feedback_tickets t
    WHERE t.user_id = p_user_id
    ORDER BY t.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views
-- ============================================================================

-- View: Tickets with latest message info (user-facing)
CREATE OR REPLACE VIEW v_feedback_tickets_with_latest AS
SELECT
    t.*,
    lm.message as last_message,
    lm.user_display_name as last_message_author,
    lm.is_staff as last_message_is_staff,
    lm.created_at as last_message_created_at,
    (SELECT COUNT(*) FROM feedback_attachments WHERE ticket_id = t.id) as attachment_count
FROM feedback_tickets t
LEFT JOIN LATERAL (
    SELECT * FROM feedback_messages
    WHERE ticket_id = t.id
    ORDER BY created_at DESC
    LIMIT 1
) lm ON true;

-- View: Admin ticket dashboard (joins academy_learners for assigned_to name)
CREATE OR REPLACE VIEW v_admin_feedback_dashboard AS
SELECT
    t.id,
    t.user_id,
    t.user_email,
    t.user_display_name,
    t.ticket_number,
    t.status,
    t.priority,
    t.category,
    t.title,
    t.description,
    t.page_url,
    t.page_path,
    t.context_data,
    t.created_at,
    t.updated_at,
    t.message_count,
    t.unread_by_admin,
    t.unread_by_user,
    t.assigned_to,
    al.first_name || ' ' || al.last_name as assigned_to_name,
    t.ai_problem_diagnosis,
    t.ai_recommended_fix,
    t.ai_analysis_model,
    t.ai_analyzed_at,
    (SELECT COUNT(*) FROM feedback_attachments WHERE ticket_id = t.id) as attachment_count,
    (SELECT message FROM feedback_messages
     WHERE ticket_id = t.id
     ORDER BY created_at DESC LIMIT 1) as last_message
FROM feedback_tickets t
LEFT JOIN academy_learners al ON al.auth_user_id = t.assigned_to
ORDER BY t.unread_by_admin DESC, t.updated_at DESC;

-- ============================================================================
-- Row-Level Security
-- ============================================================================

ALTER TABLE feedback_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_attachments ENABLE ROW LEVEL SECURITY;

-- Tickets: Users see own, admins see all
CREATE POLICY feedback_tickets_select ON feedback_tickets FOR SELECT
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM academy_learners WHERE auth_user_id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY feedback_tickets_insert ON feedback_tickets FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY feedback_tickets_update ON feedback_tickets FOR UPDATE
    USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM academy_learners WHERE auth_user_id = auth.uid() AND role = 'admin'
    ));

-- Messages: visible on tickets user can see
CREATE POLICY feedback_messages_select ON feedback_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM feedback_tickets t
        WHERE t.id = ticket_id
          AND (t.user_id = auth.uid() OR EXISTS (
              SELECT 1 FROM academy_learners WHERE auth_user_id = auth.uid() AND role = 'admin'
          ))
    ));

CREATE POLICY feedback_messages_insert ON feedback_messages FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Attachments: visible on tickets user can see
CREATE POLICY feedback_attachments_select ON feedback_attachments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM feedback_tickets t
        WHERE t.id = ticket_id
          AND (t.user_id = auth.uid() OR EXISTS (
              SELECT 1 FROM academy_learners WHERE auth_user_id = auth.uid() AND role = 'admin'
          ))
    ));

CREATE POLICY feedback_attachments_insert ON feedback_attachments FOR INSERT
    WITH CHECK (uploaded_by = auth.uid());

-- ============================================================================
-- Grant Permissions
-- ============================================================================

GRANT ALL ON feedback_tickets TO authenticated;
GRANT ALL ON feedback_messages TO authenticated;
GRANT ALL ON feedback_attachments TO authenticated;
GRANT ALL ON feedback_tickets TO service_role;
GRANT ALL ON feedback_messages TO service_role;
GRANT ALL ON feedback_attachments TO service_role;
GRANT USAGE, SELECT ON SEQUENCE feedback_ticket_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE feedback_ticket_number_seq TO service_role;

-- ============================================================================
-- Storage bucket for feedback attachments
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-attachments', 'feedback-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY feedback_storage_insert ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'feedback-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY feedback_storage_select ON storage.objects FOR SELECT
    USING (bucket_id = 'feedback-attachments');
