// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Locs & Wellness Co. — Next.js app. The client + admin wellness portal lives
// at /locs/* (App Router). The static marketing homepage and /merch storefront
// are served as static HTML from public/ via rewrites.

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      // beforeFiles runs before the public/ filesystem check, so these
      // destinations resolve to the static .html files kept in public/.
      beforeFiles: [
        // Homepage is the vanilla static build in public/ (index.html +
        // style.css + script.js + images/). This shadows the old (marketing)
        // route. public/home.html is kept as a legacy backup.
        { source: '/', destination: '/index.html' },
        // The /merch storefront stays as static HTML.
        { source: '/merch', destination: '/merch/index.html' },
      ],
    };
  },
};

export default nextConfig;
