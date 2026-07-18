# Images — The Locs + Wellness Co.

Drop real photos in here using these **exact filenames** and the site
picks them up automatically (no code changes needed).

| File               | Used for                     | Recommended size       | Notes |
|--------------------|------------------------------|------------------------|-------|
| `hero.jpg`         | Hero photo (left half)       | ~900 × 600 landscape   | Currently the clients image, cover-cropped `center 20%`. Swap for a dedicated client portrait/photo any time. |
| `hero@2x.jpg`      | Hero, retina                 | ~1800 × 1200           | Referenced via `srcset`. |
| `gallery.jpg`      | Wide 4-client gallery image  | ~1200 × 630 (≈2:1)     | The four loc styles side by side, in the label order below. |
| `gallery@2x.jpg`   | Gallery, retina              | ~2400 × 1260           | Referenced via `srcset`; provide a higher-res original for crisp large screens. |
| `lawco-logo.png`   | Spare logo / favicon source  | —                      | The on-page wordmark is live text, so this is optional. |

Current files are the **real photo pulled from the prototype**
(`lawco-preview.html`), resized. Replace them whenever Leslie has final assets.

Gallery label order (left → right in the image):
**Female / Traditional Method — Palm Roll · Male / Traditional Method — Interlock · Female / Microlocs · Male / Wick Method**

## Keep mobile fast
- Export JPGs at ~80% quality; hero under ~120 KB, gallery under ~220 KB is a good target.
- The `@2x` files are referenced via `srcset` — phones only download the size they need.
- Have WebP/AVIF? Ask to wire up `<picture>` for even lighter loads.
