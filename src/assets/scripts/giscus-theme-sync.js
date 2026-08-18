const root = document.documentElement;

function syncGiscusTheme() {
  const iframe = document.querySelector('iframe.giscus-frame');
  if (!iframe) return;
  const isDark = root.getAttribute('data-theme') === 'dark';
  // window.location.origin (rather than a hardcoded domain) so this resolves correctly in both
  // local dev and production — the iframe's own browser context fetches this URL directly, so it
  // just needs to be reachable from wherever the page itself is being viewed.
  const theme = `${window.location.origin}/assets/giscus-themes/${isDark ? 'dark' : 'light'}.css`;
  iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
}

// Watches the attribute directly (rather than the theme-toggle button's click event) so this stays
// correct regardless of script load order relative to theme-toggle.js.
new MutationObserver(syncGiscusTheme).observe(root, { attributeFilter: ['data-theme'] });

// The iframe only exists once giscus has finished its own async load, so the first sync has to wait
// for its "ready" message rather than running immediately.
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://giscus.app') return;
  if (!(event.data?.giscus?.discussion || event.data?.giscus?.viewer)) return;
  syncGiscusTheme();
});
