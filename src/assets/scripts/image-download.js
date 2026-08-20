// fa-solid fa-circle-arrow-down
const DOWNLOAD_ICON = `
  <svg viewBox="0 0 512 512" aria-hidden="true">
    <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM127 297c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l71 71L232 120c0-13.3 10.7-24 24-24s24 10.7 24 24l0 214.1 71-71c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 409c-9.4 9.4-24.6 9.4-33.9 0L127 297z"></path>
  </svg>
`;

// eleventy-img's <img srcset> lists every width it generated (e.g. "...400w, ...800w, ...1536w") —
// the widest entry is the closest thing to "the original", so that's what downloading should offer,
// not the small variant the plain `src` fallback happens to point at.
function widestSrcsetUrl(img) {
  const srcset = img.getAttribute('srcset');
  if (!srcset) return img.src;

  const candidates = srcset
    .split(',')
    .map((entry) => entry.trim().split(/\s+/))
    .filter(([url, width]) => url && width?.endsWith('w'))
    .map(([url, width]) => ({ url, width: parseInt(width, 10) }));

  if (candidates.length === 0) return img.src;

  return candidates.reduce((widest, candidate) => (candidate.width > widest.width ? candidate : widest)).url;
}

// eleventy-img's real output filenames are content hashes (e.g. "KGDHLF8E4Y-1536.jpeg"), not
// descriptive — deriving a filename from the image's alt text instead gives the downloaded file
// an actual name, the same way the reference design's own download links are purposefully named.
function filenameFromAlt(alt) {
  const slug = alt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}.jpg` : '';
}

document.querySelectorAll('.post__main figure').forEach((figure) => {
  const picture = figure.querySelector('picture');
  const img = picture?.querySelector('img');
  if (!picture || !img) return;

  const link = document.createElement('a');
  link.href = widestSrcsetUrl(img);
  link.download = filenameFromAlt(img.alt);
  link.className = 'image-download';
  link.title = 'Download image';
  link.setAttribute('aria-label', `Download image${img.alt ? `: ${img.alt}` : ''}`);
  link.innerHTML = DOWNLOAD_ICON;

  // <picture>'s content model only permits <source>/<img>/script-supporting elements, so the
  // download link can't just be appended inside it — wrapped in a positioning frame instead,
  // anchored to the image itself (not <figure>, which also contains the caption below it), so the
  // button overlays the image's own bottom-right corner regardless of whether a caption exists.
  const frame = document.createElement('div');
  frame.className = 'image-frame';
  picture.replaceWith(frame);
  frame.append(picture, link);
});
