// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// /locs/admin/website — Leslie's website editor, INSIDE her portal admin (gated
// by the (admin) layout's requireAdmin). Lets her personalize every section of
// the public locsandwellness.com homepage. Wrapped in .site-editor so editor.css
// scopes the marketing component classes without touching the portal's styles.

import { requireAdmin } from '@/lib/locs/auth';
import { getSiteContent } from '@/lib/marketing/site';
import AdminApp from '@/components/marketing/admin/AdminApp';
import './editor.css';

export const dynamic = 'force-dynamic';

export default async function WebsiteEditorPage() {
  const { user } = await requireAdmin();
  const content = await getSiteContent();
  return (
    <div className="site-editor">
      <AdminApp content={content} email={user.email ?? ''} />
    </div>
  );
}
