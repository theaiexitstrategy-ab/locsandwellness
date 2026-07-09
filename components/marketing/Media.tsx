// © 2026 GoElev8.ai | Aaron Bryant. All rights reserved. Unauthorized use prohibited.
//
// Editable media slot. When Leslie has uploaded an image (or set a video URL)
// the real asset renders; until then it shows an honest labeled placeholder —
// never a broken <img>. Used everywhere sections.tsx had a bare .media-slot.

import { resolveImage } from '@/lib/marketing/image';

const isVideo = (src: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src);

export default function Media({
  src,
  label,
  className = '',
  imgClassName = '',
}: {
  src: string | undefined | null;
  label: string;
  className?: string;
  imgClassName?: string;
}) {
  const url = resolveImage(src);

  if (!url) {
    return <div className={`media-slot ${className}`}>{label}</div>;
  }

  if (isVideo(url)) {
    return (
      <video
        src={url}
        className={`h-full w-full object-cover ${className} ${imgClassName}`}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- user-uploaded assets from Supabase storage; next/image not configured for this bucket.
  return (
    <img
      src={url}
      alt={label}
      loading="lazy"
      className={`h-full w-full object-cover ${className} ${imgClassName}`}
    />
  );
}
