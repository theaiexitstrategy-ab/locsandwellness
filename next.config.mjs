// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Locs & Wellness Co. — Next.js app. The client + admin wellness portal lives
// at /locs/* (App Router). The static marketing homepage and /merch storefront
// are served as static HTML from public/ via rewrites.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 301s so any old ebook links / past emails resolve to the consolidated guide.
  // (The prior two "ebooks" were placeholder cards with no real download URLs,
  // so nothing actually 404s today — these are a forward-safe catch-all.)
  async redirects() {
    const GUIDE = '/guides/The-Complete-Guide-to-a-Healthy-Loc-Wellness-System.pdf';
    return [
      { source: '/ebooks', destination: GUIDE, statusCode: 301 },
      { source: '/ebooks/:path*', destination: GUIDE, statusCode: 301 },
      { source: '/ebook/:path*', destination: GUIDE, statusCode: 301 },
      { source: '/downloads/healthy-scalp-starter.pdf', destination: GUIDE, statusCode: 301 },
      { source: '/downloads/loc-maintenance-at-home.pdf', destination: GUIDE, statusCode: 301 },
    ];
  },

  async rewrites() {
    return {
      // beforeFiles runs before the public/ filesystem check, so these
      // destinations resolve to the static .html files kept in public/.
      //
      // The '/' → '/index.html' rewrite was REMOVED on 2026-07-29 because
      // it shadowed the Next.js (marketing)/page.tsx server component,
      // which is the only path that reads the CMS-backed content from
      // locs_site_content. With the rewrite in place, Leslie's edits in
      // the portal Website tab were never rendered on the live site.
      // The old static HTML now lives at public/legacy-index.html as a
      // reference; the design/interactions were ported into (marketing)/
      // page.tsx and MarketingClient.tsx.
      beforeFiles: [
        // The /merch storefront stays as static HTML.
        { source: '/merch', destination: '/merch/index.html' },
      ],
    };
  },
};

export default nextConfig;
