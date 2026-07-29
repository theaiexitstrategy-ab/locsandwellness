'use server';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Client journal writes. Runs under the client's own session; RLS confines
// every write to their rows. Photos are uploaded client-side to the private
// locs-journal bucket first, then their storage paths arrive here.

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ensureClient } from '@/lib/locs/auth';

const nz = (v: unknown) => (v === '' || v === undefined ? null : v);

export type JournalInput = {
  entry_date: string;
  mood: string;
  scalp_feel: string;
  symptoms_today: string[];
  products_used: string;
  notes: string;
  photo_urls: string[];
};

export async function addJournalEntry(input: JournalInput): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const clientId = await ensureClient(supabase, user);
  if (!clientId) return { ok: false, error: 'This account is not a client account.' };

  const { error } = await supabase.from('locs_journal_entries').insert({
    client_id: clientId,
    entry_date: input.entry_date || new Date().toISOString().slice(0, 10),
    mood: nz(input.mood),
    scalp_feel: nz(input.scalp_feel),
    symptoms_today: input.symptoms_today ?? [],
    products_used: nz(input.products_used),
    notes: nz(input.notes),
    photo_urls: input.photo_urls ?? [],
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath('/locs/journal');
  revalidatePath('/locs/dashboard');
  return { ok: true };
}

// Save the client's profile picture. The image is uploaded client-side to the
// public locs-avatars bucket under {userId}/... (RLS confines the write to the
// caller's own folder); here we take the storage PATH, re-derive the public URL
// server-side (never trusting a client-supplied URL), and store it on the
// caller's own locs_clients row. Passing an empty path clears the avatar.
export async function updateAvatarUrl(path: string): Promise<{ ok: boolean; url?: string; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const clientId = await ensureClient(supabase, user);
  if (!clientId) return { ok: false, error: 'This account is not a client account.' };

  let url: string | null = null;
  if (path) {
    // Must live under the caller's own uid folder — mirrors the storage RLS.
    if (!path.startsWith(`${user.id}/`)) return { ok: false, error: 'Invalid photo path.' };
    url = supabase.storage.from('locs-avatars').getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from('locs_clients').update({ avatar_url: url }).eq('id', clientId);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/locs/dashboard');
  return { ok: true, url: url ?? undefined };
}
