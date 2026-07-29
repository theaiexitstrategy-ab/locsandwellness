-- (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
--
-- Locs & Wellness Co. — full Scalp/Hair/Loc Wellness Blueprint quiz submissions.
-- Extends the lightweight locs_quiz_leads capture with the complete answer set,
-- computed dimension scores, and the open response. Public quiz form (anon key)
-- may INSERT; submissions are PRIVATE (admin-read only).
--
-- Depends on locs_is_admin() from 20260708000000_create_locs_schema.sql.

CREATE TABLE IF NOT EXISTS locs_quiz_responses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  answers          JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { Q1: "Pride", Q11: ["Slept deeply", ...], ... }
  dimension_scores JSONB NOT NULL DEFAULT '{}'::jsonb,   -- { scalp: 72, lifestyle: 55, ... }
  overall_score    INT,
  overall_stage    TEXT,
  open_response    TEXT,                                  -- Q19, never scored
  source           TEXT NOT NULL DEFAULT 'website_quiz',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT locs_quiz_responses_name_len  CHECK (char_length(name)  BETWEEN 1 AND 120),
  CONSTRAINT locs_quiz_responses_email_len CHECK (char_length(email) BETWEEN 3 AND 200),
  CONSTRAINT locs_quiz_responses_email_fmt CHECK (POSITION('@' IN email) > 1),
  CONSTRAINT locs_quiz_responses_open_len  CHECK (open_response IS NULL OR char_length(open_response) <= 4000)
);

CREATE INDEX IF NOT EXISTS locs_quiz_responses_email_idx   ON locs_quiz_responses (email);
CREATE INDEX IF NOT EXISTS locs_quiz_responses_created_idx ON locs_quiz_responses (created_at DESC);

ALTER TABLE locs_quiz_responses ENABLE ROW LEVEL SECURITY;

-- Public quiz form may submit; server re-validates via WITH CHECK.
DROP POLICY IF EXISTS "locs_quiz_responses_public_insert" ON locs_quiz_responses;
CREATE POLICY "locs_quiz_responses_public_insert" ON locs_quiz_responses
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name)  BETWEEN 1 AND 120 AND
    char_length(email) BETWEEN 3 AND 200 AND
    POSITION('@' IN email) > 1 AND
    (open_response IS NULL OR char_length(open_response) <= 4000)
  );

-- Admins (Leslie / staff) read + manage. Scoped TO authenticated so the anon
-- role never evaluates locs_is_admin().
DROP POLICY IF EXISTS "locs_quiz_responses_admin_all" ON locs_quiz_responses;
CREATE POLICY "locs_quiz_responses_admin_all" ON locs_quiz_responses
  FOR ALL TO authenticated
  USING (locs_is_admin()) WITH CHECK (locs_is_admin());
