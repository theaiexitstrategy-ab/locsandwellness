'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Interactive journal: add a dated entry (mood, scalp feel, symptoms, products,
// photos, notes), a timeline, a photo progress gallery, and simple trend
// charts. Photos upload directly to the private locs-journal bucket under
// {userId}/... ; display uses short-lived signed URLs.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RadioChips, CheckChips, TextField, TextArea } from '@/components/locs/fields';
import { SCALP_FEEL, JOURNAL_SYMPTOMS, labelFor } from '@/lib/locs/constants';
import { addJournalEntry } from '@/app/locs/(client)/actions';

export type JournalEntry = {
  id: string; entry_date: string; mood: string | null; scalp_feel: string | null;
  symptoms_today: string[] | null; products_used: string | null;
  photo_urls: string[] | null; notes: string | null; created_at: string;
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function JournalClient({ userId, entries }: { userId: string; entries: JournalEntry[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [open, setOpen] = useState(entries.length === 0);
  const [date, setDate] = useState(today());
  const [mood, setMood] = useState('');
  const [scalpFeel, setScalpFeel] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [products, setProducts] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Resolve every stored photo path to a signed URL for display.
  const [signed, setSigned] = useState<Record<string, string>>({});
  useEffect(() => {
    const paths = entries.flatMap((e) => e.photo_urls ?? []).filter((p) => p && !signed[p]);
    if (paths.length === 0) return;
    (async () => {
      const { data } = await supabase.storage.from('locs-journal').createSignedUrls(paths, 60 * 60);
      if (!data) return;
      setSigned((prev) => {
        const next = { ...prev };
        data.forEach((d) => { if (d.signedUrl && d.path) next[d.path] = d.signedUrl; });
        return next;
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const reset = () => {
    setDate(today()); setMood(''); setScalpFeel(''); setSymptoms([]);
    setProducts(''); setNotes(''); setFiles([]);
  };

  const save = async () => {
    setSaving(true); setError('');
    try {
      const paths: string[] = [];
      for (const file of files) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `${userId}/${date}-${crypto.randomUUID()}-${safe}`;
        const { error: upErr } = await supabase.storage.from('locs-journal').upload(path, file, { upsert: false });
        if (upErr) { setError(`Photo upload failed: ${upErr.message}`); setSaving(false); return; }
        paths.push(path);
      }
      const res = await addJournalEntry({
        entry_date: date, mood, scalp_feel: scalpFeel, symptoms_today: symptoms,
        products_used: products, notes, photo_urls: paths,
      });
      if (!res.ok) { setError(res.error ?? 'Save failed.'); setSaving(false); return; }
      reset(); setOpen(false); router.refresh();
    } finally {
      setSaving(false);
    }
  };

  // Trend: symptom frequency across all entries.
  const symptomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => (e.symptoms_today ?? []).forEach((s) => { counts[s] = (counts[s] ?? 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [entries]);
  const maxCount = symptomCounts[0]?.[1] ?? 1;

  const photos = useMemo(
    () => entries.flatMap((e) => (e.photo_urls ?? []).map((p) => ({ path: p, date: e.entry_date }))),
    [entries],
  );

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-locs-emerald">Journal</h1>
          <p className="mt-1 text-locs-silver">Track how your scalp &amp; locs feel over time.</p>
        </div>
        <button className="locs-btn" onClick={() => setOpen((o) => !o)}>{open ? 'Close' : 'New entry'}</button>
      </header>

      {open && (
        <section className="locs-card space-y-4 p-6">
          {error && <p className="rounded-lg bg-locs-fire/10 px-3 py-2 text-sm text-locs-fire">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Date" type="date" value={date} onChange={setDate} />
            <TextField label="Mood" value={mood} onChange={setMood} hint="e.g. calm, tired, great" />
          </div>
          <RadioChips label="How does your scalp feel?" options={SCALP_FEEL} value={scalpFeel} onChange={setScalpFeel} allowClear />
          <CheckChips label="Symptoms today" options={JOURNAL_SYMPTOMS} values={symptoms} onChange={setSymptoms} />
          <TextField label="Products used" value={products} onChange={setProducts} />
          <TextArea label="Notes" value={notes} onChange={setNotes} />
          <div>
            <label className="locs-label">Photos</label>
            <input type="file" accept="image/*" multiple
                   onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                   className="block w-full text-sm text-locs-silver file:mr-3 file:rounded-lg file:border-0 file:bg-locs-emerald file:px-4 file:py-2 file:text-locs-ivory" />
            {files.length > 0 && <p className="mt-1 text-xs text-locs-gray">{files.length} photo(s) selected</p>}
          </div>
          <button className="locs-btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save entry'}</button>
        </section>
      )}

      {/* Trends */}
      {symptomCounts.length > 0 && (
        <section className="locs-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-locs-emerald">Symptom trends</h2>
          <div className="space-y-2">
            {symptomCounts.map(([sym, n]) => (
              <div key={sym} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-locs-silver">{labelFor(JOURNAL_SYMPTOMS, sym)}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-locs-ivory3">
                  <div className="h-full rounded-full bg-locs-emerald" style={{ width: `${(n / maxCount) * 100}%` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-sm text-locs-gray">{n}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <section className="locs-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-locs-emerald">Progress gallery</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg bg-locs-ivory3">
                {signed[p.path]
                  ? <img src={signed[p.path]} alt={`Journal photo ${fmt(p.date)}`} className="h-full w-full object-cover" />
                  : <div className="flex h-full items-center justify-center text-xs text-locs-gray">…</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-locs-emerald">Timeline</h2>
        {entries.length === 0 ? (
          <p className="rounded-xl border border-dashed border-locs-rule p-8 text-center text-locs-gray">
            No entries yet — add your first above.
          </p>
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="locs-card p-5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-locs-ink">{fmt(e.entry_date)}</span>
                  {e.scalp_feel && <span className="rounded-full bg-locs-emerald/10 px-2.5 py-0.5 text-xs text-locs-emerald">{labelFor(SCALP_FEEL, e.scalp_feel)}</span>}
                </div>
                {e.mood && <p className="mt-1 text-sm text-locs-silver">Mood: {e.mood}</p>}
                {Array.isArray(e.symptoms_today) && e.symptoms_today.length > 0 && (
                  <p className="mt-1 text-sm text-locs-silver">Symptoms: {e.symptoms_today.map((s) => labelFor(JOURNAL_SYMPTOMS, s)).join(', ')}</p>
                )}
                {e.products_used && <p className="mt-1 text-sm text-locs-silver">Products: {e.products_used}</p>}
                {e.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-locs-ink">{e.notes}</p>}
                {Array.isArray(e.photo_urls) && e.photo_urls.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {e.photo_urls.map((p, i) => (
                      <div key={i} className="h-20 w-20 overflow-hidden rounded-lg bg-locs-ivory3">
                        {signed[p] && <img src={signed[p]} alt="" className="h-full w-full object-cover" />}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
