const button = document.getElementById('back-to-top');
const SHOW_AFTER_PX = 400;

if (button) {
  const toggleVisibility = () => {
    button.classList.toggle('is-visible', window.scrollY > SHOW_AFTER_PX);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  button.addEventListener('click', () => {
    // No explicit `behavior` here on purpose — the html element's `scroll-behavior` (smooth, unless
    // the visitor prefers reduced motion) decides whether this animates.
    window.scrollTo({ top: 0 });
  });
}
