// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// /admin — Leslie's self-edit dashboard. Loads the current (merged) site
// content server-side and hands it to the client editor, which lets her change
// every field from the spec table and save section-by-section.

import { requireAdmin } from '@/lib/locs/auth';
import { getSiteContent } from '@/lib/marketing/site';
import AdminApp from '@/components/marketing/admin/AdminApp';

export default async function AdminPage() {
  const { user } = await requireAdmin();
  const content = await getSiteContent();
  return <AdminApp content={content} email={user.email ?? ''} />;
}
