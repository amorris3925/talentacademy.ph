-- Newsletter subscribers table
-- Populated during registration, updated on email verification
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email              TEXT NOT NULL UNIQUE,
  first_name         TEXT,
  last_name          TEXT,
  source             TEXT NOT NULL DEFAULT 'registration',  -- registration | landing_page | manual
  learner_id         UUID REFERENCES public.academy_learners(id) ON DELETE SET NULL,

  -- Status tracking
  email_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  subscribed         BOOLEAN NOT NULL DEFAULT TRUE,
  unsubscribed_at    TIMESTAMPTZ,
  welcome_email_sent BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  ip_address         INET,
  user_agent         TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_subscribed ON public.newsletter_subscribers(subscribed) WHERE subscribed = TRUE;

-- RLS: service role only by default (Henry Bot uses service role key)
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Admin read access
CREATE POLICY "Admins can read subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.academy_learners
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
