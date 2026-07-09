// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Locs & Wellness Co. — server-side auth/role helpers. Uses the shared
// @supabase/ssr server client (lib/supabase/server). Role lives on locs_users;
// admins are seeded out-of-band, clients are provisioned lazily on first visit.

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type LocsRole = 'client' | 'admin';

export const SIGNIN_PATH = '/locs/signin';
export const CLIENT_HOME = '/locs/dashboard';
export const ADMIN_HOME = '/locs/admin';
export const INTAKE_PATH = '/locs/intake';

/** Return the signed-in Supabase user, or redirect to sign-in. */
export async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(SIGNIN_PATH);
  return { supabase, user };
}

/** Require an admin session; redirect non-admins to the client home / sign-in. */
export async function requireAdmin() {
  const { supabase, user } = await requireUser();
  const role = await getRole(supabase, user.id);
  if (role !== 'admin') redirect(role === 'client' ? CLIENT_HOME : SIGNIN_PATH);
  return { supabase, user };
}

/**
 * Require a client session; provision the client identity and redirect admins
 * to their portal. Returns the locs_clients id alongside the session.
 */
export async function requireClient() {
  const { supabase, user } = await requireUser();
  if ((await getRole(supabase, user.id)) === 'admin') redirect(ADMIN_HOME);
  const clientId = await ensureClient(supabase, user);
  if (!clientId) redirect(ADMIN_HOME);
  return { supabase, user, clientId };
}

/** Read the locs role for a user id (null if no locs_users row yet). */
export async function getRole(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<LocsRole | null> {
  const { data } = await supabase.from('locs_users').select('role').eq('id', userId).maybeSingle();
  return (data?.role as LocsRole) ?? null;
}

/**
 * Ensure a signed-in visitor has a client identity. Provisions the
 * locs_users (role='client') + locs_clients rows on first visit. No-ops for
 * admins. Returns the locs_clients row id, or null for admins.
 */
export async function ensureClient(
  supabase: ReturnType<typeof createClient>,
  user: { id: string; email?: string | null },
): Promise<string | null> {
  let role = await getRole(supabase, user.id);

  if (role === null) {
    // RLS locks self-insert to role='client', so this cannot self-promote.
    await supabase.from('locs_users').insert({ id: user.id, role: 'client' });
    role = 'client';
  }
  if (role === 'admin') return null;

  const { data: existing } = await supabase
    .from('locs_clients').select('id').eq('user_id', user.id).maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from('locs_clients')
    .insert({ user_id: user.id, email: user.email ?? null })
    .select('id')
    .single();
  return created?.id ?? null;
}
