'use client';
// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Reusable admin editing primitives shared by every section editor. Kept
// intentionally small and uniform so the whole CMS feels consistent for Leslie.

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { resolveImage } from '@/lib/marketing/image';

const BUCKET = 'locs-site';

const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-site-muted';
const inputCls =
  'mt-1.5 w-full rounded-xl border border-site-rule bg-white px-3.5 py-2.5 text-sm text-site-ink outline-none transition focus:border-site-emerald';

export function Field({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function Area({
  label, value, onChange, rows = 3, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <textarea className={`${inputCls} resize-y leading-relaxed`} rows={rows} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1">
      <input type="checkbox" className="h-4 w-4 accent-site-emerald" checked={checked}
        onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm text-site-wood">{label}</span>
    </label>
  );
}

/** Upload an image/video to the public locs-site bucket, or paste a URL.
 *  Stores a storage path (or the pasted URL) as the field value. */
export function ImageField({
  label, value, onChange, folder,
}: { label: string; value: string; onChange: (v: string) => void; folder: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const preview = resolveImage(value);

  async function upload(file: File) {
    setErr(null);
    setBusy(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${folder}/${crypto.randomUUID()}-${safe}`;
      const supabase = createClient();
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true, cacheControl: '3600' });
      if (error) throw error;
      onChange(path);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="mt-1.5 flex items-start gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-site-wood/25 bg-site-wood/[0.04] text-[10px] uppercase text-site-muted">
          {preview
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={preview} alt="" className="h-full w-full object-cover" />
            : 'None'}
        </div>
        <div className="flex-1">
          <label className="btn-outline cursor-pointer text-xs">
            {busy ? 'Uploading…' : 'Upload'}
            <input type="file" accept="image/*,video/*" className="hidden" disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')} className="ml-2 text-xs text-red-600 hover:underline">
              Remove
            </button>
          )}
          <input className={`${inputCls} text-xs`} value={value} placeholder="…or paste an image / video URL"
            onChange={(e) => onChange(e.target.value)} />
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  );
}

/** Edit an array of plain strings (pills, bio paragraphs, certifications). */
export function StringList({
  label, items, onChange, textarea = false, addLabel = 'Add',
}: { label: string; items: string[]; onChange: (v: string[]) => void; textarea?: boolean; addLabel?: string }) {
  const set = (i: number, v: string) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, '']);
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="mt-1.5 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2">
            {textarea
              ? <textarea className={`${inputCls} mt-0 flex-1`} rows={2} value={it} onChange={(e) => set(i, e.target.value)} />
              : <input className={`${inputCls} mt-0 flex-1`} value={it} onChange={(e) => set(i, e.target.value)} />}
            <button type="button" onClick={() => remove(i)}
              className="mt-1 shrink-0 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50">Remove</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn-outline mt-2 text-xs">+ {addLabel}</button>
    </div>
  );
}

/** Card wrapper for a section: heading, help text, save button with status. */
export function SectionCard({
  id, title, help, children, onSave,
}: {
  id: string; title: string; help?: string; children: React.ReactNode;
  onSave: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setState('saving'); setErr(null);
    const res = await onSave();
    if (res.ok) { setState('saved'); setTimeout(() => setState('idle'), 2500); }
    else { setState('error'); setErr(res.error ?? 'Save failed'); }
  }

  return (
    <section id={id} className="card scroll-mt-24 p-6 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-site-wood2">{title}</h2>
          {help && <p className="mt-1 text-sm text-site-muted">{help}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {state === 'saved' && <span className="text-xs font-medium text-site-emerald">✓ Saved</span>}
          {state === 'error' && <span className="max-w-[12rem] truncate text-xs text-red-600" title={err ?? ''}>{err}</span>}
          <button type="button" onClick={save} disabled={state === 'saving'} className="btn-emerald text-sm disabled:opacity-60">
            {state === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** A bordered sub-block for one item within a repeatable list. */
export function ItemBox({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <div className="relative rounded-2xl border border-site-rule bg-white/50 p-4">
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="absolute right-3 top-3 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50">Remove</button>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
}
