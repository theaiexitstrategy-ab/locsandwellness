// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Journal page — loads the client's dated entries and hands them to the
// interactive journal (add entry, photo upload, timeline, trends).

import { requireClient } from '@/lib/locs/auth';
import JournalClient, { type JournalEntry } from '@/components/locs/JournalClient';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
  const { supabase, user, clientId } = await requireClient();

  const { data } = await supabase
    .from('locs_journal_entries')
    .select('*')
    .eq('client_id', clientId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  return <JournalClient userId={user.id} entries={(data ?? []) as JournalEntry[]} />;
}
