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
