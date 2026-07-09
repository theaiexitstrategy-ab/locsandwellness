'use client';
// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const signOut = async () => {
    await createClient().auth.signOut();
    router.push('/locs/signin');
    router.refresh();
  };
  return (
    <button onClick={signOut} className="text-sm text-locs-silver hover:text-locs-emerald transition">
      Sign out
    </button>
  );
}
