const copyButton = document.getElementById('copy-link');
const copyMessage = document.getElementById('copy-message');

if (copyButton && copyMessage) {
  copyButton.addEventListener('click', async () => {
    const url = window.location.href.split('#')[0];
    try {
      await navigator.clipboard.writeText(url);
      copyMessage.classList.add('is-visible');
      setTimeout(() => copyMessage.classList.remove('is-visible'), 2000);
    } catch {
      // Clipboard API can fail (permissions, insecure context) — link is still right there in the
      // address bar, so just skip the confirmation message rather than showing an error.
    }
  });
}
