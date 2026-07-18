-- (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
--
-- Locs & Wellness Co. — quiz lead capture.
--
-- Backs the "Scalp, Hair & Loc Wellness Quiz" name/email gate on the marketing
-- site (site/index.html modal). The public quiz form (anon key) may INSERT a
-- lead, but leads are PRIVATE: only an admin (Leslie / staff) may read or manage
-- them. This is the inverse of locs_site_content (public read / admin write).
--
-- Depends on locs_is_admin() from 20260708000000_create_locs_schema.sql
-- (same shared platform DB).

-- ============================================================
-- TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS locs_quiz_leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT 'website_quiz',   -- where the lead came from
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT locs_quiz_leads_name_len  CHECK (char_length(name)  BETWEEN 1 AND 120),
  CONSTRAINT locs_quiz_leads_email_len CHECK (char_length(email) BETWEEN 3 AND 200),
  CONSTRAINT locs_quiz_leads_email_fmt CHECK (POSITION('@' IN email) > 1)
);

CREATE INDEX IF NOT EXISTS locs_quiz_leads_email_idx   ON locs_quiz_leads (email);
CREATE INDEX IF NOT EXISTS locs_quiz_leads_created_idx ON locs_quiz_leads (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE locs_quiz_leads ENABLE ROW LEVEL SECURITY;

-- Public quiz form (anon or signed-in) may submit ONE lead per insert.
-- The WITH CHECK re-validates on the server so the anon key can't write junk.
-- No SELECT is granted to anon, so the form cannot read anyone's leads back.
DROP POLICY IF EXISTS "locs_quiz_leads_public_insert" ON locs_quiz_leads;
CREATE POLICY "locs_quiz_leads_public_insert" ON locs_quiz_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name)  BETWEEN 1 AND 120 AND
    char_length(email) BETWEEN 3 AND 200 AND
    POSITION('@' IN email) > 1
  );

-- Only admins (Leslie / staff) may read and manage captured leads.
-- Scoped TO authenticated so the anon quiz-form role never evaluates
-- locs_is_admin() (anon lacks EXECUTE on it, which would hard-error the
-- public INSERT). Admins are always authenticated, so this is equivalent
-- for them.
DROP POLICY IF EXISTS "locs_quiz_leads_admin_all" ON locs_quiz_leads;
CREATE POLICY "locs_quiz_leads_admin_all" ON locs_quiz_leads
  FOR ALL TO authenticated
  USING (locs_is_admin()) WITH CHECK (locs_is_admin());
