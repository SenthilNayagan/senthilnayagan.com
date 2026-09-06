// fa-solid fa-circle-arrow-down — same icon as image-download.js.
const DOWNLOAD_ICON = `
  <svg viewBox="0 0 512 512" aria-hidden="true">
    <path d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM127 297c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l71 71L232 120c0-13.3 10.7-24 24-24s24 10.7 24 24l0 214.1 71-71c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9L273 409c-9.4 9.4-24.6 9.4-33.9 0L127 297z"></path>
  </svg>
`;

// Every diagram already carries a <title> for accessibility — reused here as the download's
// filename source, the same way image-download.js derives one from an image's alt text.
function filenameFromTitle(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}.svg` : 'diagram.svg';
}

// These diagrams theme via var(--color-*) custom properties defined on :root, which only resolve
// inside this page. A standalone downloaded file has no access to that stylesheet, so the current
// theme's actual values (light or dark, whichever is active right now) get baked in first.
function resolveThemeColors(svgMarkup) {
  const rootStyles = getComputedStyle(document.documentElement);
  return svgMarkup.replace(/var\(--color-[a-z-]+\)/g, (match) => {
    const propertyName = match.slice(4, -1); // "var(--color-x)" -> "--color-x"
    const value = rootStyles.getPropertyValue(propertyName).trim();
    return value || match;
  });
}

function serializeForDownload(svg) {
  const clone = svg.cloneNode(true);
  if (!clone.hasAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  return resolveThemeColors(clone.outerHTML);
}

document.querySelectorAll('.prose .diagram').forEach((diagram) => {
  const svg = diagram.querySelector('svg');
  if (!svg) return;

  const title = diagram.querySelector('svg > title')?.textContent ?? '';

  // Built upfront, like image-download.js's real image URL, rather than lazily on click — an <a>
  // with no href yet isn't a real hyperlink, so it wouldn't get a pointer cursor (or work with
  // "open in new tab", etc.) until after its first click.
  const blob = new Blob([serializeForDownload(svg)], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filenameFromTitle(title);
  link.className = 'image-download';
  link.title = 'Download diagram';
  link.setAttribute('aria-label', `Download diagram${title ? `: ${title}` : ''}`);
  link.innerHTML = DOWNLOAD_ICON;

  // Reuses .image-frame/.image-download as-is (see _prose.scss) — same positioning, same badge,
  // just wrapping an <svg> here instead of a <picture>.
  const frame = document.createElement('div');
  frame.className = 'image-frame';
  svg.replaceWith(frame);
  frame.append(svg, link);
});
