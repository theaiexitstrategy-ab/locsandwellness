// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Admin area gate. Only role='admin' (Leslie / staff) reaches anything here.

import { requireAdmin } from '@/lib/locs/auth';
import { LocsNav, LocsFooter } from '@/components/locs/chrome';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen">
      <LocsNav title="Locs & Wellness · Admin" links={[{ href: '/locs/admin', label: 'Clients' }]} />
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      <div className="mx-auto max-w-5xl px-5"><LocsFooter /></div>
    </div>
  );
}
