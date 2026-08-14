const codeBlocks = document.querySelectorAll('.prose pre[class*="language-"]');

codeBlocks.forEach((pre) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.setAttribute('aria-label', 'Copy code');

  button.innerHTML = `
    <svg class="code-copy__icon code-copy__icon--copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
    <svg class="code-copy__icon code-copy__icon--check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  button.addEventListener('click', async () => {
    const code = pre.querySelector('code');
    const text = code ? code.textContent : pre.textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Copied');
      setTimeout(() => {
        button.classList.remove('is-copied');
        button.setAttribute('aria-label', 'Copy code');
      }, 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — the code is still selectable by hand.
    }
  });

  pre.appendChild(button);
});
