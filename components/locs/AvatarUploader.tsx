'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Client profile picture. Uploads directly to the public locs-avatars bucket
// under {userId}/... (RLS confines writes to the caller's own folder), then
// persists the URL to the caller's locs_clients row via a server action.
// Mirrors the journal upload pattern.

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { updateAvatarUrl } from '@/app/locs/(client)/actions';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

function initials(name: string | null | undefined) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '🌿';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function AvatarUploader({
  userId, initialUrl, name,
}: { userId: string; initialUrl: string | null; name: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = ''; // allow re-picking the same file
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    if (file.size > MAX_BYTES) { setError('Image must be under 5MB.'); return; }

    setBusy(true);
    try {
      const supabase = createClient();
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${userId}/avatar-${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('locs-avatars').upload(path, file, {
        upsert: false, contentType: file.type, cacheControl: '3600',
      });
      if (upErr) { setError(`Upload failed: ${upErr.message}`); setBusy(false); return; }

      const res = await updateAvatarUrl(path);
      if (!res.ok) { setError(res.error ?? 'Could not save photo.'); setBusy(false); return; }

      setUrl(res.url ?? null);
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('[avatar]', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-locs-emerald/10 ring-1 ring-locs-emerald/20">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name ? `${name}'s profile photo` : 'Profile photo'} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl text-locs-emerald">
            {initials(name)}
          </div>
        )}
      </div>
      <div>
        <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button type="button" onClick={pick} disabled={busy} className="locs-btn">
          {busy ? 'Uploading…' : url ? 'Change photo' : 'Add a photo'}
        </button>
        {error
          ? <p className="mt-1.5 text-xs text-locs-fire">{error}</p>
          : <p className="mt-1.5 text-xs text-locs-gray">JPG or PNG, up to 5MB.</p>}
      </div>
    </div>
  );
}
