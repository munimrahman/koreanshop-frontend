import type { ImageLoaderProps } from 'next/image';

export function cloudfrontLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.includes('res.cloudinary.com')) {
    const marker = '/image/upload/';
    const idx = src.indexOf(marker);
    if (idx === -1) return `${src}?w=${width}`;

    const base = src.substring(0, idx + marker.length);
    const rest = src.substring(idx + marker.length);
    // Strip any existing transformation segment (e.g. "w_800,q_auto/")
    const stripped = rest.replace(/^(?:[a-z]+_[^/,]+,?)+\//, '');

    return `${base}f_auto,w_${width},q_${quality ?? 75}/${stripped}`;
  }

  // CloudFront and local static files: append width as a no-op query param.
  // The server ignores it; Next.js requires it to suppress the loader width warning.
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}w=${width}`;
}
