// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Admin client roster. Reads every client (admin RLS grants full access) with
// loc stage + concern rating + last journal date embedded for the list.

import { requireAdmin } from '@/lib/locs/auth';
import Roster, { type RosterItem } from '@/components/locs/Roster';

export const dynamic = 'force-dynamic';

export default async function AdminRosterPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from('locs_clients')
    .select(`
      id, full_name, email, intake_submitted_at, intake_updated_at,
      locs_loc_profile ( loc_stage, last_retwist_date ),
      locs_intake_scalp_history ( concern_rating, main_concerns ),
      locs_journal_entries ( entry_date )
    `)
    .order('intake_updated_at', { ascending: false, nullsFirst: false });

  const items: RosterItem[] = (data ?? []).map((c: any) => {
    const loc = Array.isArray(c.locs_loc_profile) ? c.locs_loc_profile[0] : c.locs_loc_profile;
    const scalp = Array.isArray(c.locs_intake_scalp_history) ? c.locs_intake_scalp_history[0] : c.locs_intake_scalp_history;
    const journalDates: string[] = (c.locs_journal_entries ?? []).map((j: any) => j.entry_date).filter(Boolean);
    const lastVisit = journalDates.sort().at(-1) ?? null;
    return {
      id: c.id,
      fullName: c.full_name ?? '(no name yet)',
      email: c.email ?? '',
      locStage: loc?.loc_stage ?? null,
      concernRating: scalp?.concern_rating ?? null,
      intakeSubmittedAt: c.intake_submitted_at ?? null,
      intakeUpdatedAt: c.intake_updated_at ?? null,
      lastVisit,
    };
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-locs-emerald">Clients</h1>
        <p className="mt-1 text-locs-silver">{items.length} client{items.length === 1 ? '' : 's'}</p>
      </header>
      <Roster items={items} />
    </div>
  );
}
