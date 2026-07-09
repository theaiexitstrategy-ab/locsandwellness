'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Admin roster list with search + filters (name, loc stage, concern level,
// last visit). Client-side filtering — the client count is small.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LOC_STAGE, labelFor } from '@/lib/locs/constants';

export type RosterItem = {
  id: string; fullName: string; email: string;
  locStage: string | null; concernRating: number | null;
  intakeSubmittedAt: string | null; intakeUpdatedAt: string | null; lastVisit: string | null;
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

// Flag intakes updated in the last 7 days as "needs review".
function isNew(item: RosterItem): boolean {
  if (!item.intakeUpdatedAt) return false;
  return Date.now() - new Date(item.intakeUpdatedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export default function Roster({ items }: { items: RosterItem[] }) {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [minConcern, setMinConcern] = useState(0);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (q && !i.fullName.toLowerCase().includes(q.toLowerCase()) && !i.email.toLowerCase().includes(q.toLowerCase())) return false;
      if (stage && i.locStage !== stage) return false;
      if (minConcern && (i.concernRating ?? 0) < minConcern) return false;
      return true;
    });
  }, [items, q, stage, minConcern]);

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} className="locs-input" />
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="locs-input sm:w-44">
          <option value="">All loc stages</option>
          {LOC_STAGE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={minConcern} onChange={(e) => setMinConcern(Number(e.target.value))} className="locs-input sm:w-44">
          <option value={0}>Any concern level</option>
          {[3, 5, 7, 9].map((n) => <option key={n} value={n}>Concern ≥ {n}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-locs-rule p-8 text-center text-locs-gray">No clients match.</p>
      ) : (
        <ul className="divide-y divide-locs-rule overflow-hidden rounded-2xl border border-locs-rule bg-locs-ivory2">
          {filtered.map((i) => (
            <li key={i.id}>
              <Link href={`/locs/admin/${i.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-locs-ivory3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-locs-ink">{i.fullName}</span>
                    {isNew(i) && <span className="rounded-full bg-locs-gold/20 px-2 py-0.5 text-xs text-locs-gold">New intake</span>}
                  </div>
                  <span className="text-sm text-locs-gray">{i.email}</span>
                </div>
                <div className="flex shrink-0 items-center gap-5 text-sm">
                  <span className="hidden sm:block text-locs-silver">{labelFor(LOC_STAGE, i.locStage)}</span>
                  <span className="text-locs-silver">Concern {i.concernRating ?? '—'}</span>
                  <span className="hidden md:block text-locs-gray">Last visit {fmt(i.lastVisit)}</span>
                  <span className="text-locs-emerald">→</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
