-- Trigger function: when academy_lesson_progress is inserted or updated to 'completed',
-- automatically award XP, update enrollment progress_pct, and update learner xp_total.

CREATE OR REPLACE FUNCTION public.fn_cascade_lesson_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_xp_reward INTEGER;
  v_track_id UUID;
  v_total_lessons INTEGER;
  v_completed_lessons INTEGER;
  v_new_progress_pct NUMERIC;
  v_total_xp INTEGER;
BEGIN
  -- Only act when status changes to 'completed'
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;

  -- Skip if already processed (xp_earned already set)
  IF OLD IS NOT NULL AND OLD.status = 'completed' AND OLD.xp_earned > 0 THEN
    RETURN NEW;
  END IF;

  -- 1. Award XP: look up the lesson's xp_reward
  SELECT xp_reward INTO v_xp_reward
  FROM public.academy_lessons
  WHERE id = NEW.lesson_id;

  IF v_xp_reward IS NOT NULL AND v_xp_reward > 0 THEN
    NEW.xp_earned := v_xp_reward;
  ELSE
    NEW.xp_earned := COALESCE(v_xp_reward, 0);
  END IF;

  -- 2. Find the track this lesson belongs to (lesson -> module -> track)
  SELECT m.track_id INTO v_track_id
  FROM public.academy_lessons l
  JOIN public.academy_modules m ON m.id = l.module_id
  WHERE l.id = NEW.lesson_id;

  -- 3. Update enrollment progress_pct
  IF v_track_id IS NOT NULL THEN
    -- Count total lessons in this track
    SELECT COUNT(*) INTO v_total_lessons
    FROM public.academy_lessons l
    JOIN public.academy_modules m ON m.id = l.module_id
    WHERE m.track_id = v_track_id;

    -- Count completed lessons for this learner in this track
    SELECT COUNT(*) INTO v_completed_lessons
    FROM public.academy_lesson_progress p
    JOIN public.academy_lessons l ON l.id = p.lesson_id
    JOIN public.academy_modules m ON m.id = l.module_id
    WHERE m.track_id = v_track_id
      AND p.learner_id = NEW.learner_id
      AND p.status = 'completed';

    -- Include the current row if it wasn't already counted
    -- (it's being inserted/updated in this transaction)
    IF NOT EXISTS (
      SELECT 1 FROM public.academy_lesson_progress
      WHERE lesson_id = NEW.lesson_id
        AND learner_id = NEW.learner_id
        AND status = 'completed'
        AND id <> NEW.id
    ) THEN
      v_completed_lessons := v_completed_lessons + 1;
    END IF;

    -- Calculate percentage
    IF v_total_lessons > 0 THEN
      v_new_progress_pct := ROUND((v_completed_lessons::NUMERIC / v_total_lessons::NUMERIC) * 100, 1);
    ELSE
      v_new_progress_pct := 0;
    END IF;

    -- Update the enrollment row
    UPDATE public.academy_enrollments
    SET progress_pct = v_new_progress_pct,
        completed_at = CASE
          WHEN v_new_progress_pct >= 100 THEN NOW()
          ELSE completed_at
        END
    WHERE learner_id = NEW.learner_id
      AND track_id = v_track_id;
  END IF;

  -- 4. Update learner's total XP
  SELECT COALESCE(SUM(xp_earned), 0) INTO v_total_xp
  FROM public.academy_lesson_progress
  WHERE learner_id = NEW.learner_id
    AND status = 'completed'
    AND id <> NEW.id;

  -- Add the current row's XP
  v_total_xp := v_total_xp + COALESCE(NEW.xp_earned, 0);

  UPDATE public.academy_learners
  SET xp_total = v_total_xp,
      updated_at = NOW()
  WHERE id = NEW.learner_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if present (idempotent)
DROP TRIGGER IF EXISTS trg_cascade_lesson_completion ON public.academy_lesson_progress;

-- Create trigger: fires BEFORE INSERT OR UPDATE so we can modify NEW.xp_earned
CREATE TRIGGER trg_cascade_lesson_completion
  BEFORE INSERT OR UPDATE ON public.academy_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_cascade_lesson_completion();

-- Backfill: fix any existing completed lessons that have xp_earned = 0
UPDATE public.academy_lesson_progress p
SET xp_earned = l.xp_reward
FROM public.academy_lessons l
WHERE p.lesson_id = l.id
  AND p.status = 'completed'
  AND (p.xp_earned IS NULL OR p.xp_earned = 0)
  AND l.xp_reward > 0;

-- Backfill: recalculate all enrollment progress_pct values
UPDATE public.academy_enrollments e
SET progress_pct = COALESCE(sub.pct, 0)
FROM (
  SELECT
    en.id AS enrollment_id,
    ROUND(
      (COUNT(CASE WHEN p.status = 'completed' THEN 1 END)::NUMERIC /
       NULLIF(COUNT(l.id), 0)::NUMERIC) * 100, 1
    ) AS pct
  FROM public.academy_enrollments en
  JOIN public.academy_modules m ON m.track_id = en.track_id
  JOIN public.academy_lessons l ON l.module_id = m.id
  LEFT JOIN public.academy_lesson_progress p
    ON p.lesson_id = l.id AND p.learner_id = en.learner_id
  GROUP BY en.id
) sub
WHERE e.id = sub.enrollment_id;

-- Backfill: recalculate all learner xp_total values
UPDATE public.academy_learners lr
SET xp_total = COALESCE(sub.total_xp, 0)
FROM (
  SELECT learner_id, SUM(xp_earned) AS total_xp
  FROM public.academy_lesson_progress
  WHERE status = 'completed'
  GROUP BY learner_id
) sub
WHERE lr.id = sub.learner_id;
