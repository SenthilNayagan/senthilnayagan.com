const trigger = document.getElementById('search-trigger');
const dialog = document.getElementById('search-dialog');
const input = document.getElementById('search-input');
const closeButton = document.getElementById('search-close');
const results = document.getElementById('search-results');

if (trigger && dialog instanceof HTMLDialogElement && input && closeButton && results) {
  let pagefind;
  let debounceTimer;

  // Loaded lazily on first open rather than on every page load, since most visits never open search.
  const loadPagefind = async () => {
    if (!pagefind) {
      pagefind = await import('/pagefind/pagefind.js');
      await pagefind.init();
    }
    return pagefind;
  };

  // Anchors the dialog just under the search icon, right-aligned to it, clamped so it never runs
  // off-screen on narrow viewports. Run after showModal() so the dialog has real layout to measure.
  const positionDialog = () => {
    const gap = 8;
    const triggerRect = trigger.getBoundingClientRect();
    const dialogRect = dialog.getBoundingClientRect();
    const left = Math.max(
      gap,
      Math.min(triggerRect.right - dialogRect.width, window.innerWidth - dialogRect.width - gap)
    );
    const top = triggerRect.bottom + gap;
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
    dialog.style.maxHeight = `${window.innerHeight - top - gap}px`;
  };

  const openSearch = async () => {
    dialog.showModal();
    positionDialog();
    window.addEventListener('resize', positionDialog);
    input.focus();
    await loadPagefind();
  };

  const stripTags = (html) => html.replace(/<[^>]+>/g, '');

  // Pagefind's default search silently falls back to typo-tolerant fuzzy matching when a word
  // doesn't exist verbatim anywhere in the index, rather than returning zero results — e.g.
  // searching "aiu" finds no page that starts with those exact letters, so it corrects to the
  // common word "ai" instead and returns AI-related pages the visitor never typed. An earlier
  // version of this filtered results through Pagefind's quoted/exact-match mode, but that mode's
  // own prefix matching turned out to be unreliable at certain partial-word lengths — e.g. exact
  // "referent" matches but exact "referen" (one character shorter) doesn't, breaking normal
  // search-as-you-type. Verifying against the result's own title/excerpt instead sidesteps that
  // entirely: every typed word must literally appear (as a substring, so partial words still
  // match while typing) somewhere in what's actually shown for that result, regardless of which
  // Pagefind search mode found it.
  const searchLiteral = async (pf, query) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const search = await pf.search(query);
    const items = await Promise.all(search.results.slice(0, 8).map((result) => result.data()));
    return items.filter((item) => {
      const haystack = `${stripTags(item.excerpt)} ${item.meta?.title ?? ''}`.toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  };

  const escapeHtml = (value) =>
    value.replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
    );

  const renderResults = (items) => {
    if (items.length === 0) {
      results.innerHTML = '<p class="search-results__empty">No results found.</p>';
      return;
    }
    results.innerHTML = items
      .map((item) => {
        const title = item.meta?.title ? escapeHtml(item.meta.title) : item.url;
        return `<a class="search-results__item" href="${item.url}">
          <span class="search-results__title">${title}</span>
          <span class="search-results__excerpt">${item.excerpt}</span>
        </a>`;
      })
      .join('');
  };

  trigger.addEventListener('click', openSearch);

  closeButton.addEventListener('click', () => dialog.close());

  // Click on the ::backdrop (outside the box) closes it — a click inside the box lands on a
  // descendant, not the dialog itself, so this only fires for genuine outside clicks.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    window.removeEventListener('resize', positionDialog);
    input.value = '';
    results.innerHTML = '';
  });

  // "/" opens search from anywhere on the site, unless the visitor is already typing somewhere.
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || dialog.open) {
      return;
    }
    const target = event.target;
    const isTyping =
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (!isTyping) {
      event.preventDefault();
      openSearch();
    }
  });

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = input.value.trim();
    if (!query) {
      results.innerHTML = '';
      return;
    }
    debounceTimer = setTimeout(async () => {
      const pf = await loadPagefind();
      const items = await searchLiteral(pf, query);
      // The query could have changed while these promises were in flight — drop stale results.
      if (input.value.trim() === query) {
        renderResults(items);
      }
    }, 150);
  });
}
