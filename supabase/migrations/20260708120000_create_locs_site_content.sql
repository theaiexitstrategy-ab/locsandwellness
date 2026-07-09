-- (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
--
-- Locs & Wellness Co. — marketing-site CMS store.
--
-- Backs the self-edit /admin layer so Leslie can personalize every section of
-- locsandwellness.com (copy, photos/video, links) without a developer. One row
-- per page section, keyed by a stable section slug; the section's editable
-- fields live in a JSONB blob whose shape mirrors lib/marketing/content.ts
-- DEFAULTS. The public homepage reads these rows and merges them OVER the
-- code defaults, so an un-edited section simply falls back to its default.
--
-- Depends on locs_is_admin() and locs_set_updated_at() from
-- 20260708000000_create_locs_schema.sql (same shared platform DB).

-- ============================================================
-- TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS locs_site_content (
  key        TEXT PRIMARY KEY,          -- section slug: hero, quiz, method, services, ...
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

DROP TRIGGER IF EXISTS trg_locs_site_content_updated ON locs_site_content;
CREATE TRIGGER trg_locs_site_content_updated
  BEFORE UPDATE ON locs_site_content
  FOR EACH ROW EXECUTE FUNCTION locs_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
-- The marketing site is public, so ANYONE (even anon) may READ content.
-- Only an admin (Leslie / staff) may write it.
ALTER TABLE locs_site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "locs_site_content_public_read" ON locs_site_content;
CREATE POLICY "locs_site_content_public_read" ON locs_site_content
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "locs_site_content_admin_write" ON locs_site_content;
CREATE POLICY "locs_site_content_admin_write" ON locs_site_content
  FOR ALL USING (locs_is_admin()) WITH CHECK (locs_is_admin());

-- ============================================================
-- STORAGE — public marketing asset bucket
-- ============================================================
-- Hero/service/product photos, ebook covers, headshot, before/after shots.
-- PUBLIC read (these are meant to be seen on the live site); admin-only write.
INSERT INTO storage.buckets (id, name, public)
VALUES ('locs-site', 'locs-site', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "locs_site_obj_read"   ON storage.objects;
CREATE POLICY "locs_site_obj_read"   ON storage.objects FOR SELECT
  USING (bucket_id = 'locs-site');

DROP POLICY IF EXISTS "locs_site_obj_insert" ON storage.objects;
CREATE POLICY "locs_site_obj_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'locs-site' AND locs_is_admin());

DROP POLICY IF EXISTS "locs_site_obj_update" ON storage.objects;
CREATE POLICY "locs_site_obj_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'locs-site' AND locs_is_admin());

DROP POLICY IF EXISTS "locs_site_obj_delete" ON storage.objects;
CREATE POLICY "locs_site_obj_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'locs-site' AND locs_is_admin());
