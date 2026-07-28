// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Auth middleware for the /locs portal.
//
// 1. Email-confirmation and magic-link emails redirect to /locs?code=... (PKCE).
//    Supabase verifies the email server-side, but the `code` still has to be
//    exchanged for a session cookie or the visitor lands signed-OUT (this is why
//    a confirmed account got "no access"). We do that exchange here.
// 2. On every /locs request we refresh the session so server components see the
//    signed-in user.
//
// Scoped to /locs so it never touches the static marketing homepage, /merch, or
// /images.

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Confirmation / magic-link landing: exchange the PKCE code for a session,
  // then redirect to a clean URL (session cookies carried onto the redirect).
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const url = request.nextUrl.clone();
    url.searchParams.delete('code');
    if (error) {
      url.pathname = '/locs/signin';
      url.searchParams.set('error', 'link_invalid');
    }
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // Refresh the session for normal /locs navigation.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/locs', '/locs/:path*'],
};
