// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Locs & Wellness Co. — Next.js app. The client + admin wellness portal lives
// at /locs/* (App Router). The static marketing homepage and /merch storefront
// are served as static HTML from public/ via rewrites.

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The ebook is now a paid merch product, so old free-download links must NOT
  // hand out the PDF. They resolve to the ebook section on the homepage instead.
  // (The former public guide PDF path was retired on 2026-07-29; the file now
  // lives at an unguessable path handed out only to buyers via email.)
  async redirects() {
    const EBOOK_SECTION = '/#guide';
    const OLD_GUIDE = '/guides/The-Complete-Guide-to-a-Healthy-Loc-Wellness-System.pdf';
    return [
      { source: '/ebooks', destination: EBOOK_SECTION, statusCode: 301 },
      { source: '/ebooks/:path*', destination: EBOOK_SECTION, statusCode: 301 },
      { source: '/ebook/:path*', destination: EBOOK_SECTION, statusCode: 301 },
      { source: OLD_GUIDE, destination: EBOOK_SECTION, statusCode: 301 },
      { source: '/downloads/healthy-scalp-starter.pdf', destination: EBOOK_SECTION, statusCode: 301 },
      { source: '/downloads/loc-maintenance-at-home.pdf', destination: EBOOK_SECTION, statusCode: 301 },
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
