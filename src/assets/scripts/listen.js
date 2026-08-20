const button = document.getElementById('listen-button');

if (button && 'speechSynthesis' in window) {
  // Starts `hidden` in the markup (see components/share.liquid) so a browser without
  // SpeechSynthesis support — or one where this script fails to load — never shows a button that
  // wouldn't do anything.
  button.hidden = false;

  const prose = document.querySelector('.prose');
  const title = document.querySelector('.post__title');

  // Priming call — Chrome's voice list loads asynchronously and sometimes needs an initial
  // getVoices() poke before it actually populates, ahead of the real lookup at click time.
  speechSynthesis.getVoices();

  // Block-by-block (not clone.textContent on the whole thing) so headings/paragraphs/list items
  // get a period between them instead of running straight into each other with no pause. <pre>
  // and inline <svg> diagrams are dropped entirely — reading raw code syntax or an SVG's scattered
  // <text> labels aloud verbatim is closer to noise than narration.
  function readableText() {
    const clone = prose.cloneNode(true);
    clone.querySelectorAll('pre, svg').forEach((el) => el.remove());

    const blocks = clone.querySelectorAll('h1, h2, h3, h4, p, li, blockquote, td, th');
    const body = [...blocks]
      .map((el) => el.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('. ');

    const titleText = title ? `${title.textContent.trim()}. ` : '';
    return titleText + body;
  }

  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find((voice) => voice.lang === 'en-US' && /natural|neural|premium|enhanced/i.test(voice.name)) ||
      voices.find((voice) => voice.lang === 'en-US') ||
      voices.find((voice) => voice.lang.startsWith('en')) ||
      voices[0]
    );
  }

  function setSpeaking(isSpeaking) {
    button.classList.toggle('is-speaking', isSpeaking);
    button.setAttribute('aria-label', isSpeaking ? 'Pause listening' : 'Listen to this post');
    button.title = isSpeaking ? 'Pause' : 'Listen to this post';
  }

  button.addEventListener('click', () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setSpeaking(false);
      return;
    }
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setSpeaking(true);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(readableText());
    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    speechSynthesis.speak(utterance);
    setSpeaking(true);
  });

  // A full page load happens between posts (this isn't a SPA), so speech would already stop on
  // its own — this just avoids a stray moment of audio continuing into the page-hide transition.
  window.addEventListener('pagehide', () => speechSynthesis.cancel());
}
