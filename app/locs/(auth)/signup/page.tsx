'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Client signup. The locs_users (role='client') + locs_clients rows are
// provisioned lazily on first authenticated visit (see lib/locs/auth
// ensureClient), so this page only needs to create the auth user. No public
// admin signup exists — admin accounts are seeded.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setNotice(''); setLoading(true);
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/locs` },
    });
    if (authError) { setError(authError.message); setLoading(false); return; }

    // Email confirmation off → session exists immediately, go to intake.
    if (data.session) {
      router.push('/locs/intake');
      router.refresh();
      return;
    }
    // Email confirmation on → wait for the confirmation link.
    setLoading(false);
    setNotice('Almost there — check your email to confirm your account, then sign in.');
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-5">Create your account</h2>
      {error && <p className="mb-4 rounded-lg bg-locs-fire/10 px-3 py-2 text-sm text-locs-fire">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-locs-emerald/10 px-3 py-2 text-sm text-locs-emerald">{notice}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="locs-label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="locs-input" />
        </div>
        <div>
          <label className="locs-label">Password</label>
          <input type="password" required minLength={8} value={password}
                 onChange={(e) => setPassword(e.target.value)} className="locs-input" />
          <p className="mt-1 text-xs text-locs-gray">At least 8 characters.</p>
        </div>
        <button type="submit" disabled={loading} className="locs-btn w-full">
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-locs-silver">
        Already have an account?{' '}
        <Link href="/locs/signin" className="text-locs-emerald hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
