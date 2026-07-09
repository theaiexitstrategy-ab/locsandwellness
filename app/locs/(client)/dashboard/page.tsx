// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Client dashboard home. Own intake summary + loc/retwist countdown + any
// scalp summary Leslie has PUBLISHED (RLS returns only visible_to_client rows;
// no clinical table is ever queried here).

import Link from 'next/link';
import { requireClient } from '@/lib/locs/auth';
import { LOC_STAGE, LOC_METHOD, MAIN_CONCERNS, ELEMENTS, labelFor } from '@/lib/locs/constants';

export const dynamic = 'force-dynamic';

const fmt = (d: any) => (d ? new Date(d).toLocaleDateString() : '—');

function retwistCountdown(last: string | null, weeks: number | null) {
  if (!last || !weeks) return null;
  const next = new Date(last);
  next.setDate(next.getDate() + weeks * 7);
  const days = Math.round((next.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return { next, days };
}

export default async function DashboardPage() {
  const { supabase, clientId } = await requireClient();

  const [client, loc, scalp, summary, journal] = await Promise.all([
    supabase.from('locs_clients').select('full_name, intake_submitted_at').eq('id', clientId).maybeSingle(),
    supabase.from('locs_loc_profile').select('*').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_intake_scalp_history').select('main_concerns, concern_rating').eq('client_id', clientId).maybeSingle(),
    supabase.from('locs_scalp_summary').select('*').eq('visible_to_client', true)
      .order('assessed_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('locs_journal_entries').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
  ]);

  const c: any = client.data ?? {}, l: any = loc.data ?? {}, s: any = scalp.data ?? {}, plan: any = summary.data;
  const firstName = (c.full_name ?? '').split(' ')[0] || 'there';
  const countdown = retwistCountdown(l.last_retwist_date ?? null, l.retwist_frequency_weeks ?? null);
  const journalCount = journal.count ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-locs-emerald">Hi {firstName} 🌿</h1>
        <p className="mt-1 text-locs-silver">Your personal scalp &amp; loc wellness space.</p>
      </header>

      {/* Loc stage + retwist countdown */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="locs-card p-5">
          <p className="text-sm text-locs-gray">Loc stage</p>
          <p className="mt-1 font-display text-xl text-locs-ink">{labelFor(LOC_STAGE, l.loc_stage)}</p>
          <p className="mt-0.5 text-sm text-locs-silver">{labelFor(LOC_METHOD, l.loc_method)}</p>
        </div>
        <div className="locs-card p-5">
          <p className="text-sm text-locs-gray">Next retwist</p>
          {countdown ? (
            <>
              <p className="mt-1 font-display text-xl text-locs-ink">
                {countdown.days >= 0 ? `${countdown.days} days` : `${Math.abs(countdown.days)} days ago`}
              </p>
              <p className="mt-0.5 text-sm text-locs-silver">Due {fmt(countdown.next)}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-locs-silver">Add your retwist cycle in <Link className="text-locs-emerald hover:underline" href="/locs/intake">My intake</Link>.</p>
          )}
        </div>
      </section>

      {/* Published plan from Leslie */}
      {plan ? (
        <section className="locs-card border-locs-emerald/30 bg-locs-emerald/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-locs-emerald px-2.5 py-0.5 text-xs text-locs-ivory">From Leslie</span>
            <span className="text-xs text-locs-gray">{fmt(plan.assessed_at)}</span>
          </div>
          <h2 className="font-display text-lg font-semibold text-locs-emerald">Your wellness summary</h2>
          {plan.dominant_element && <p className="mt-2 text-sm"><b>Dominant element:</b> {labelFor(ELEMENTS, plan.dominant_element)}</p>}
          {Array.isArray(plan.secondary_elements) && plan.secondary_elements.length > 0 && (
            <p className="text-sm"><b>Secondary:</b> {plan.secondary_elements.map((e: string) => labelFor(ELEMENTS, e)).join(', ')}</p>
          )}
          {plan.key_imbalances && <p className="mt-1 text-sm"><b>Key focus areas:</b> {plan.key_imbalances}</p>}
          {plan.recommended_focus && <p className="text-sm"><b>Recommended focus:</b> {plan.recommended_focus}</p>}
          {plan.professional_plan_preview && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-locs-ink">{plan.professional_plan_preview}</p>
          )}
        </section>
      ) : (
        <section className="locs-card p-6 text-sm text-locs-silver">
          Leslie hasn’t published a wellness summary for you yet. It’ll appear here after your assessment.
        </section>
      )}

      {/* Concerns snapshot + journal CTA */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="locs-card p-5">
          <p className="text-sm text-locs-gray">Your main concerns</p>
          <p className="mt-1 text-sm text-locs-ink">
            {Array.isArray(s.main_concerns) && s.main_concerns.length
              ? s.main_concerns.map((v: string) => labelFor(MAIN_CONCERNS, v)).join(', ') : '—'}
          </p>
          {s.concern_rating && <p className="mt-2 text-sm text-locs-silver">You rated your concern {s.concern_rating}/10.</p>}
        </div>
        <div className="locs-card flex flex-col justify-between p-5">
          <div>
            <p className="text-sm text-locs-gray">Journal</p>
            <p className="mt-1 text-sm text-locs-ink">{journalCount} {journalCount === 1 ? 'entry' : 'entries'} logged.</p>
          </div>
          <Link href="/locs/journal" className="locs-btn mt-3 w-full">Open your journal</Link>
        </div>
      </section>

      {!c.intake_submitted_at && (
        <p className="rounded-lg bg-locs-gold/10 px-4 py-3 text-sm text-locs-gold">
          Finish your <Link href="/locs/intake" className="underline">intake</Link> so Leslie can personalize your care.
        </p>
      )}
    </div>
  );
}
