const tocLinks = document.querySelectorAll('.post__toc a[href^="#"]');

if (tocLinks.length > 0) {
  const linksById = new Map(
    [...tocLinks].map((link) => [decodeURIComponent(link.getAttribute('href').slice(1)), link])
  );
  const headings = [...linksById.keys()].map((id) => document.getElementById(id)).filter(Boolean);

  let currentLink = null;
  const setCurrent = (link) => {
    if (link === currentLink) {
      return;
    }
    currentLink?.classList.remove('is-current');
    link?.classList.add('is-current');
    currentLink = link;
  };

  // Treats a heading as "current" once it crosses into the top 30% of the viewport, and keeps it
  // current until the next heading crosses the same line — the standard scrollspy trick.
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
}
