'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Leslie's editable clinical layer for one client. Five tabs: Professional
// Assessment, Elemental Pattern, Scalp Zone Map, Summary (with per-record
// publish-to-client toggle), and private Notes. Every save inserts a new
// dated version so change-over-time is preserved.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RadioChips, CheckChips, TextArea, TextField, IntensityDots, Toggle } from '@/components/locs/fields';
import {
  SEBUM_LEVEL, BARRIER_STATUS, MICROBIOME_BALANCE, INFLAMMATION_LEVEL, FOLLICLE_ACTIVITY,
  SCALP_SENSITIVITY, HYDRATION_LEVEL, ELEMENTS, SCALP_ZONES, labelFor,
} from '@/lib/locs/constants';
import {
  saveProAssessment, saveElemental, saveZoneMap, saveSummary, toggleSummaryVisible, addAdminNote,
} from '@/app/locs/(admin)/actions';

export type ClinicalData = {
  clientId: string;
  proHistory: any[];
  elementalHistory: any[];
  zoneSnapshots: { assessedAt: string; zones: Record<string, any> }[];
  summaries: any[];
  notes: any[];
};

const TABS = ['Assessment', 'Elemental', 'Zone Map', 'Summary', 'Notes'] as const;
const fmt = (d: any) => (d ? new Date(d).toLocaleString() : '—');
const ELEMENT_COLORS: Record<string, string> = { fire: '#C0492E', water: '#2E6FB0', air: '#8A8073', earth: '#7A5C2E' };

function Msg({ error }: { error: string }) {
  if (!error) return null;
  return <p className="rounded-lg bg-locs-fire/10 px-3 py-2 text-sm text-locs-fire">{error}</p>;
}

export default function ClinicalPanels({ data }: { data: ClinicalData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Assessment');

  return (
    <div className="locs-card p-5">
      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-locs-ivory3 p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    tab === t ? 'bg-locs-emerald text-locs-ivory' : 'text-locs-silver hover:text-locs-ink'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Assessment' && <AssessmentTab data={data} />}
      {tab === 'Elemental' && <ElementalTab data={data} />}
      {tab === 'Zone Map' && <ZoneMapTab data={data} />}
      {tab === 'Summary' && <SummaryTab data={data} />}
      {tab === 'Notes' && <NotesTab data={data} />}
    </div>
  );
}

// ---------- Professional Scalp Assessment ----------
function AssessmentTab({ data }: { data: ClinicalData }) {
  const router = useRouter();
  const [f, setF] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true); setError('');
    const res = await saveProAssessment(data.clientId, f);
    setSaving(false);
    if (!res.ok) return setError(res.error ?? 'Save failed.');
    setF({}); router.refresh();
  };

  const FIELDS: [string, string, any[]][] = [
    ['sebum_level', 'Sebum level', SEBUM_LEVEL],
    ['barrier_status', 'Barrier status', BARRIER_STATUS],
    ['microbiome_balance', 'Microbiome', MICROBIOME_BALANCE],
    ['inflammation_level', 'Inflammation', INFLAMMATION_LEVEL],
    ['follicle_activity', 'Follicle activity', FOLLICLE_ACTIVITY],
    ['scalp_sensitivity', 'Sensitivity', SCALP_SENSITIVITY],
    ['hydration_level', 'Hydration', HYDRATION_LEVEL],
  ];

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-locs-emerald">New professional assessment</h3>
      <Msg error={error} />
      <div className="space-y-4">
        {FIELDS.map(([key, label, opts]) => (
          <RadioChips key={key} label={label} options={opts} value={f[key] ?? ''} onChange={set(key)} allowClear />
        ))}
      </div>
      <button className="locs-btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save assessment'}</button>

      <History title="Assessment history" rows={data.proHistory}
        render={(r) => (
          <>
            <p className="text-xs text-locs-gray">{fmt(r.assessed_at)} · {r.assessed_by}</p>
            <p className="mt-1 text-sm">
              {FIELDS.map(([key, label, opts]) => r[key] && `${label}: ${labelFor(opts, r[key])}`)
                .filter(Boolean).join(' · ') || '—'}
            </p>
          </>
        )} />
    </div>
  );
}

// ---------- Elemental Pattern ----------
function ElementalTab({ data }: { data: ClinicalData }) {
  const router = useRouter();
  const [v, setV] = useState({ fire: 0, water: 0, air: 0, earth: 0 });
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setSaving(true); setError('');
    const res = await saveElemental(data.clientId, {
      fire_intensity: v.fire, water_intensity: v.water, air_intensity: v.air, earth_intensity: v.earth,
      primary_element: primary, secondary_elements: secondary,
    });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? 'Save failed.');
    setV({ fire: 0, water: 0, air: 0, earth: 0 }); setPrimary(''); setSecondary([]); router.refresh();
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-locs-emerald">New elemental pattern</h3>
      <Msg error={error} />
      <div className="space-y-3 rounded-xl border border-locs-rule p-4">
        {(['fire', 'water', 'air', 'earth'] as const).map((el) => (
          <IntensityDots key={el} label={el[0].toUpperCase() + el.slice(1)} max={4} color={ELEMENT_COLORS[el]}
            value={v[el]} onChange={(n) => setV((s) => ({ ...s, [el]: n }))} />
        ))}
      </div>
      <RadioChips label="Primary element" options={ELEMENTS} value={primary} onChange={setPrimary} allowClear />
      <CheckChips label="Secondary elements" options={ELEMENTS} values={secondary} onChange={setSecondary} />
      <button className="locs-btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save pattern'}</button>

      <History title="Elemental history" rows={data.elementalHistory}
        render={(r) => (
          <>
            <p className="text-xs text-locs-gray">{fmt(r.assessed_at)}</p>
            <p className="mt-1 text-sm">
              🔥 {r.fire_intensity ?? 0} · 💧 {r.water_intensity ?? 0} · 🌬 {r.air_intensity ?? 0} · ⛰ {r.earth_intensity ?? 0}
              {r.primary_element && ` · primary: ${labelFor(ELEMENTS, r.primary_element)}`}
            </p>
          </>
        )} />
    </div>
  );
}

// ---------- Scalp Zone Map ----------
function ZoneMapTab({ data }: { data: ClinicalData }) {
  const router = useRouter();
  const blank = () => SCALP_ZONES.reduce((acc, z) => {
    acc[z.value] = { fire: 0, water: 0, air: 0, earth: 0, notes: '' }; return acc;
  }, {} as Record<string, any>);
  const [zones, setZones] = useState<Record<string, any>>(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const setZone = (zone: string, patch: any) => setZones((s) => ({ ...s, [zone]: { ...s[zone], ...patch } }));

  const save = async () => {
    setSaving(true); setError('');
    const rows = SCALP_ZONES.map((z) => ({ zone: z.value, ...zones[z.value] }));
    const res = await saveZoneMap(data.clientId, new Date().toISOString(), rows);
    setSaving(false);
    if (!res.ok) return setError(res.error ?? 'Save failed.');
    setZones(blank()); router.refresh();
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-locs-emerald">New scalp zone map</h3>
      <Msg error={error} />
      <div className="space-y-3">
        {SCALP_ZONES.map((z) => (
          <div key={z.value} className="rounded-xl border border-locs-rule p-4">
            <p className="mb-2 font-medium text-locs-ink">{z.label}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(['fire', 'water', 'air', 'earth'] as const).map((el) => (
                <IntensityDots key={el} label={el[0].toUpperCase() + el.slice(1)} max={2} color={ELEMENT_COLORS[el]}
                  value={zones[z.value][el]} onChange={(n) => setZone(z.value, { [el]: n })} />
              ))}
            </div>
            <input placeholder="Zone notes…" className="locs-input mt-2" value={zones[z.value].notes}
                   onChange={(e) => setZone(z.value, { notes: e.target.value })} />
          </div>
        ))}
      </div>
      <button className="locs-btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save zone map'}</button>

      <History title="Zone map history" rows={data.zoneSnapshots}
        render={(snap) => (
          <>
            <p className="text-xs text-locs-gray">{fmt(snap.assessedAt)}</p>
            <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {SCALP_ZONES.map((z) => {
                const zd = snap.zones[z.value];
                if (!zd) return null;
                return (
                  <p key={z.value} className="text-xs text-locs-silver">
                    <span className="text-locs-ink">{z.label}:</span> 🔥{zd.fire} 💧{zd.water} 🌬{zd.air} ⛰{zd.earth}
                    {zd.notes ? ` — ${zd.notes}` : ''}
                  </p>
                );
              })}
            </div>
          </>
        )} />
    </div>
  );
}

// ---------- Overall Scalp Summary (+ publish toggle) ----------
function SummaryTab({ data }: { data: ClinicalData }) {
  const router = useRouter();
  const [f, setF] = useState({
    dominant_element: '', key_imbalances: '', recommended_focus: '',
    professional_plan_preview: '', visible_to_client: false,
  });
  const [secondary, setSecondary] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const save = async () => {
    setSaving(true); setError('');
    const res = await saveSummary(data.clientId, { ...f, secondary_elements: secondary });
    setSaving(false);
    if (!res.ok) return setError(res.error ?? 'Save failed.');
    setF({ dominant_element: '', key_imbalances: '', recommended_focus: '', professional_plan_preview: '', visible_to_client: false });
    setSecondary([]); router.refresh();
  };

  const togglePublish = async (id: string, next: boolean) => {
    setBusyId(id);
    const res = await toggleSummaryVisible(data.clientId, id, next);
    setBusyId('');
    if (!res.ok) return setError(res.error ?? 'Update failed.');
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-locs-emerald">New scalp summary</h3>
      <Msg error={error} />
      <RadioChips label="Dominant element" options={ELEMENTS} value={f.dominant_element}
                  onChange={(v) => setF((s) => ({ ...s, dominant_element: v }))} allowClear />
      <CheckChips label="Secondary elements" options={ELEMENTS} values={secondary} onChange={setSecondary} />
      <TextArea label="Key imbalances" value={f.key_imbalances} onChange={(v) => setF((s) => ({ ...s, key_imbalances: v }))} />
      <TextArea label="Recommended focus" value={f.recommended_focus} onChange={(v) => setF((s) => ({ ...s, recommended_focus: v }))} />
      <TextArea label="Professional plan preview" rows={4} value={f.professional_plan_preview}
                onChange={(v) => setF((s) => ({ ...s, professional_plan_preview: v }))}
                hint="This is what the client sees when you publish the summary to them." />
      <Toggle label="Publish to client immediately" checked={f.visible_to_client}
              onChange={(v) => setF((s) => ({ ...s, visible_to_client: v }))} />
      <button className="locs-btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save summary'}</button>

      <div className="pt-2">
        <h4 className="mb-2 text-sm font-semibold text-locs-silver">Summary history</h4>
        {data.summaries.length === 0 ? <p className="text-sm text-locs-gray">None yet.</p> : (
          <ul className="space-y-2">
            {data.summaries.map((r) => (
              <li key={r.id} className="rounded-xl border border-locs-rule p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-locs-gray">{fmt(r.assessed_at)}</p>
                  <label className="flex items-center gap-2 text-xs">
                    <span className={r.visible_to_client ? 'text-locs-emerald' : 'text-locs-gray'}>
                      {r.visible_to_client ? 'Visible to client' : 'Private'}
                    </span>
                    <Toggle label="" checked={!!r.visible_to_client}
                            onChange={(next) => togglePublish(r.id, next)} />
                  </label>
                </div>
                {r.dominant_element && <p className="mt-1 text-sm"><b>Dominant:</b> {labelFor(ELEMENTS, r.dominant_element)}</p>}
                {r.key_imbalances && <p className="text-sm"><b>Imbalances:</b> {r.key_imbalances}</p>}
                {r.recommended_focus && <p className="text-sm"><b>Focus:</b> {r.recommended_focus}</p>}
                {r.professional_plan_preview && <p className="mt-1 whitespace-pre-wrap text-sm text-locs-silver">{r.professional_plan_preview}</p>}
                {busyId === r.id && <p className="mt-1 text-xs text-locs-gray">Updating…</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ---------- Private Admin Notes ----------
function NotesTab({ data }: { data: ClinicalData }) {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const add = async () => {
    setSaving(true); setError('');
    const res = await addAdminNote(data.clientId, note);
    setSaving(false);
    if (!res.ok) return setError(res.error ?? 'Save failed.');
    setNote(''); router.refresh();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-locs-emerald">Private notes</h3>
      <p className="text-sm text-locs-gray">Only you see these — never shown to the client.</p>
      <Msg error={error} />
      <TextArea label="Add a note" value={note} onChange={setNote} rows={3} />
      <button className="locs-btn" disabled={saving || !note.trim()} onClick={add}>{saving ? 'Saving…' : 'Add note'}</button>
      <ul className="space-y-2 pt-2">
        {data.notes.map((n) => (
          <li key={n.id} className="rounded-xl border border-locs-rule p-3">
            <p className="text-xs text-locs-gray">{fmt(n.created_at)} · {n.author}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-locs-ink">{n.note}</p>
          </li>
        ))}
        {data.notes.length === 0 && <li className="text-sm text-locs-gray">No notes yet.</li>}
      </ul>
    </div>
  );
}

// ---------- shared history block ----------
function History({ title, rows, render }: { title: string; rows: any[]; render: (r: any) => React.ReactNode }) {
  return (
    <div className="pt-2">
      <h4 className="mb-2 text-sm font-semibold text-locs-silver">{title}</h4>
      {rows.length === 0 ? <p className="text-sm text-locs-gray">None yet.</p> : (
        <ul className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.id ?? r.assessedAt ?? i} className="rounded-xl border border-locs-rule p-3">{render(r)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
