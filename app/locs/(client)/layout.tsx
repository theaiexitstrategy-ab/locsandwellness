// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Client area gate. role='admin' is bounced to the admin portal; brand-new
// visitors are provisioned as clients. This area NEVER queries clinical tables.

import { requireClient } from '@/lib/locs/auth';
import { LocsNav, LocsFooter } from '@/components/locs/chrome';

export const dynamic = 'force-dynamic';

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireClient();
  return (
    <div className="min-h-screen">
      <LocsNav
        links={[
          { href: '/locs/dashboard', label: 'Home' },
          { href: '/locs/journal', label: 'Journal' },
          { href: '/locs/intake', label: 'My intake' },
        ]}
      />
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
      <div className="mx-auto max-w-3xl px-5"><LocsFooter /></div>
    </div>
  );
}
