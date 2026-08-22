const button = document.getElementById('listen-button');
const src = button?.dataset.audioSrc;

if (button && src) {
  const audio = new Audio(src);
  audio.preload = 'none';

  function setSpeaking(isSpeaking) {
    button.classList.toggle('is-speaking', isSpeaking);
    button.setAttribute('aria-label', isSpeaking ? 'Pause listening' : 'Listen to this post');
    button.title = isSpeaking ? 'Pause' : 'Listen to this post';
  }

  // Driven by the audio element's own events (not set directly in the click handler) so the button
  // stays in sync regardless of what causes playback to start/stop — including it simply ending.
  audio.addEventListener('play', () => setSpeaking(true));
  audio.addEventListener('pause', () => setSpeaking(false));

  // Starts `hidden` in the markup (see components/share.liquid). Unhidden only once the audio is
  // confirmed to actually exist — narration is generated out-of-band (see lib/audio.js) and can lag
  // behind a post going live, so data-audio-src pointing at a 404 is an expected, temporary state,
  // not a bug. `preload = 'none'` above means nothing is fetched until this explicit check.
  audio.addEventListener('loadedmetadata', () => (button.hidden = false), { once: true });
  audio.addEventListener('error', () => (button.hidden = true));
  audio.load();

  button.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  // A full page load happens between posts (this isn't a SPA), so playback would already stop on
  // its own — this just avoids a stray moment of audio continuing into the page-hide transition.
  window.addEventListener('pagehide', () => audio.pause());
}
