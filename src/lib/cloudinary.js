/**
 * Centralized Cloudinary Transform Utility
 * src/lib/cloudinary.js
 *
 * All Cloudinary image transforms go through here.
 * To add a new size: add an entry to TRANSFORMS.
 * To swap CDN: change this one file.
 */

const TRANSFORMS = {
  thumbnail: 'w_300,h_300,c_fill,f_auto,q_auto',
  gallery:   'w_800,f_auto,q_auto',
  full:      'w_1400,f_auto,q_auto',
  og:        'w_1200,h_630,c_fill,f_auto,q_auto',
  admin:     'w_400,c_fill,f_auto,q_auto',
};

/**
 * Get an optimized Cloudinary URL.
 * Falls back to original URL if not a Cloudinary URL.
 *
 * @param {string} url        - Original image URL
 * @param {'thumbnail'|'gallery'|'full'|'og'|'admin'} type - Transform preset
 * @returns {string}
 */
export function getOptimizedImage(url, type = 'gallery') {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;   // local or external — pass-through

  const transform = TRANSFORMS[type] || TRANSFORMS.gallery;

  // Insert transformation: .../upload/w_800,f_auto,q_auto/...
  if (url.includes('/upload/')) {
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  return url;
}

/**
 * Generate srcSet string for responsive images.
 * Only works for Cloudinary URLs.
 */
export function getCloudinarySrcSet(url) {
  if (!url || !url.includes('cloudinary.com')) return undefined;
  const widths = [400, 800, 1200, 1600];
  return widths
    .map(w => `${url.replace('/upload/', `/upload/w_${w},f_auto,q_auto/`)} ${w}w`)
    .join(', ');
}

/**
 * Check if a URL is a Cloudinary URL.
 */
export function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('cloudinary.com');
}

/**
 * Get a safe fallback image URL.
 */
export function getFallbackImage() {
  return '/placeholder.png';
}
