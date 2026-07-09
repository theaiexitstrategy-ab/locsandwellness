// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Entry point for /locs — routes a visitor by auth + role.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getRole, ensureClient, SIGNIN_PATH, ADMIN_HOME, CLIENT_HOME, INTAKE_PATH,
} from '@/lib/locs/auth';

export const dynamic = 'force-dynamic';

export default async function LocsIndex() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(SIGNIN_PATH);

  const role = await getRole(supabase, user.id);
  if (role === 'admin') redirect(ADMIN_HOME);

  // Client (or brand-new visitor): provision, then send to intake or dashboard.
  const clientId = await ensureClient(supabase, user);
  if (clientId) {
    const { data: client } = await supabase
      .from('locs_clients').select('intake_submitted_at').eq('id', clientId).maybeSingle();
    if (!client?.intake_submitted_at) redirect(INTAKE_PATH);
  }
  redirect(CLIENT_HOME);
}
