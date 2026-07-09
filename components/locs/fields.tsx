'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Reusable form controls for the Locs & Wellness portal (intake + admin
// clinical panels). Chip-style single/multi select plus plain inputs.

import type { Option } from '@/lib/locs/constants';

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="locs-label">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-locs-gray">{hint}</p>}
    </div>
  );
}

export function TextField({
  label, value, onChange, type = 'text', hint, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; hint?: string; required?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type={type} required={required} value={value}
             onChange={(e) => onChange(e.target.value)} className="locs-input" />
    </Field>
  );
}

export function TextArea({
  label, value, onChange, hint, rows = 3,
}: { label: string; value: string; onChange: (v: string) => void; hint?: string; rows?: number }) {
  return (
    <Field label={label} hint={hint}>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="locs-input" />
    </Field>
  );
}

export function NumberField({
  label, value, onChange, hint, min, max,
}: {
  label: string; value: number | ''; onChange: (v: number | '') => void;
  hint?: string; min?: number; max?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <input type="number" min={min} max={max} value={value}
             onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
             className="locs-input" />
    </Field>
  );
}

/** Single-select as chips. Pass allowClear to let a click toggle off. */
export function RadioChips({
  label, options, value, onChange, hint, allowClear,
}: {
  label: string; options: Option[]; value: string; onChange: (v: string) => void;
  hint?: string; allowClear?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.value;
          return (
            <span key={o.value}
                  className={`locs-chip ${on ? 'locs-chip-on' : ''}`}
                  onClick={() => onChange(allowClear && on ? '' : o.value)}>
              {o.label}
            </span>
          );
        })}
      </div>
    </Field>
  );
}

/** Multi-select as chips (string[]). */
export function CheckChips({
  label, options, values, onChange, hint,
}: {
  label: string; options: Option[]; values: string[];
  onChange: (v: string[]) => void; hint?: string;
}) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o.value);
          return (
            <span key={o.value}
                  className={`locs-chip ${on ? 'locs-chip-on' : ''}`}
                  onClick={() => toggle(o.value)}>
              {o.label}
            </span>
          );
        })}
      </div>
    </Field>
  );
}

export function Toggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
              className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-locs-emerald' : 'bg-locs-rule'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      <span className="text-sm text-locs-ink">{label}</span>
    </label>
  );
}

/** 0..max intensity dots (elemental / zone map). */
export function IntensityDots({
  label, value, onChange, max = 4, color = '#0C5140',
}: { label: string; value: number; onChange: (v: number) => void; max?: number; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-locs-ink">{label}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: max + 1 }).map((_, i) => (
          <button key={i} type="button" onClick={() => onChange(i)}
                  title={`${i}`}
                  className="h-5 w-5 rounded-full border transition"
                  style={{
                    borderColor: color,
                    background: i > 0 && i <= value ? color : 'transparent',
                    opacity: i === 0 ? 0.35 : 1,
                  }} />
        ))}
      </div>
    </div>
  );
}
