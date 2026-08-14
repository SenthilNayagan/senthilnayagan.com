const tocLinks = document.querySelectorAll('.post__toc a[href^="#"]');

if (tocLinks.length > 0) {
  const linksById = new Map(
    [...tocLinks].map((link) => [decodeURIComponent(link.getAttribute('href').slice(1)), link])
  );
  const headings = [...linksById.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const firstLink = linksById.get(headings[0]?.id);
  const lastLink = linksById.get(headings[headings.length - 1]?.id);

  let currentLink = null;
  const setCurrent = (link) => {
    if (!link || link === currentLink) {
      return;
    }
    currentLink?.classList.remove('is-current');
    link.classList.add('is-current');
    currentLink = link;
  };

  // Treats a heading as "current" once it crosses into the top 30% of the viewport, and keeps it
  // current until the next heading crosses the same line — the standard scrollspy trick. On its own
  // this leaves two gaps: the first heading may never reach that line if the page loads scrolled to
  // the very top, and the last heading often never reaches it either if there isn't enough page left
  // below it to scroll. The boundary check below covers both.
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length === 0) {
        return;
      }
      const topmost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
      setCurrent(linksById.get(topmost.target.id));
    },
    { rootMargin: '0px 0px -70% 0px' }
  );

  headings.forEach((heading) => observer.observe(heading));

  let ticking = false;
  const checkScrollBoundary = () => {
    ticking = false;
    const scrollBottom = window.scrollY + window.innerHeight;
    const pageBottom = document.documentElement.scrollHeight - 2;
    if (window.scrollY <= 0) {
      setCurrent(firstLink);
    } else if (scrollBottom >= pageBottom) {
      setCurrent(lastLink);
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(checkScrollBoundary);
      }
    },
    { passive: true }
  );

  checkScrollBoundary();
}
