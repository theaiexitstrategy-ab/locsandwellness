'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.
//
// Locs & Wellness sign-in — email/password + magic link. Shares the platform
// Supabase auth.users table; role routing happens at /locs.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function mapAuthError(error: { code?: string; message?: string }): string {
  switch (error.code) {
    case 'invalid_credentials': return 'Email or password is incorrect.';
    case 'email_not_confirmed': return 'Please confirm your email before signing in.';
    case 'too_many_requests': return 'Too many attempts. Please wait and try again.';
    default: return error.message || 'Something went wrong. Please try again.';
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setNotice(''); setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(mapAuthError(authError)); setLoading(false); return; }
    router.push('/locs');
    router.refresh();
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email first to get a magic link.'); return; }
    setError(''); setNotice(''); setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/locs` },
    });
    setLoading(false);
    if (authError) { setError(mapAuthError(authError)); return; }
    setNotice('Check your email for a magic sign-in link.');
  };

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-5">Welcome back</h2>
      {error && <p className="mb-4 rounded-lg bg-locs-fire/10 px-3 py-2 text-sm text-locs-fire">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-locs-emerald/10 px-3 py-2 text-sm text-locs-emerald">{notice}</p>}
      <form onSubmit={handlePassword} className="space-y-4">
        <div>
          <label className="locs-label">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="locs-input" />
        </div>
        <div>
          <label className="locs-label">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="locs-input" />
        </div>
        <button type="submit" disabled={loading} className="locs-btn w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <button onClick={handleMagicLink} disabled={loading} className="mt-3 w-full text-sm text-locs-emerald hover:underline">
        Email me a magic link instead
      </button>
      <p className="mt-6 text-center text-sm text-locs-silver">
        New here?{' '}
        <Link href="/locs/signup" className="text-locs-emerald hover:underline">Create your account</Link>
      </p>
    </div>
  );
}
