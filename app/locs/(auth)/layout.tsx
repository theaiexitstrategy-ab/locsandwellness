// (c) 2026 GoElev8.ai | Aaron Bryant. All rights reserved.

import { LocsFooter } from '@/components/locs/chrome';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-semibold text-locs-emerald">Locs &amp; Wellness Co.</h1>
          <p className="mt-2 text-locs-silver">Your scalp &amp; loc wellness journal</p>
        </div>
        <div className="locs-card p-7">{children}</div>
        <LocsFooter />
      </div>
    </div>
  );
}
