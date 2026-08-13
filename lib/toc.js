// Left by {% include "toc.md" %} at the point in the article where a table of contents was requested.
export const TOC_MARKER = '<!--eleventy-toc-->';
// Left by the post layout's sidebar `<aside>`, i.e. where the built TOC actually gets rendered — a
// separate spot from TOC_MARKER, since the TOC itself lives in a sticky sidebar, not inline in the
// article body where the marker was written.
export const TOC_SLOT = '<!--eleventy-toc-slot-->';

const HEADING_RE =
  /<h([1-4]) id="([^"]+)"[^>]*>\s*<a class="header-anchor"[^>]*><span>([\s\S]*?)<\/span><\/a>\s*<\/h\1>/g;

/** Builds a nested table of contents from the heading anchors markdown-it-anchor left in the page, and
 * moves it from its inline position (TOC_MARKER, written by {% include "toc.md" %}) into the sidebar
 * slot (TOC_SLOT, written by the post layout). Runs as an Eleventy transform (rather than inside the
 * include itself) because the marker is substituted before Markdown renders the headings, so the
 * headings don't exist yet at the point the include runs.
 * @param {string} content
 */
export const buildToc = (content) => {
  if (!content.includes(TOC_MARKER)) {
    // This post didn't request a TOC — drop the empty slot so the sidebar's :empty CSS rule can hide it.
    return content.includes(TOC_SLOT) ? content.replace(TOC_SLOT, '') : content;
  }

  // A post can request the TOC more than once (harmless — same content, e.g. a long post that repeats
  // {% include "toc.md" %}), so strip every occurrence, not just the first.
  const withoutMarker = content.replaceAll(TOC_MARKER, '');

  const headings = [...content.matchAll(HEADING_RE)].map(([, level, id, text]) => ({
    level: Number(level),
    id,
    text,
    children: [],
  }));

  if (headings.length === 0) {
    return withoutMarker.replace(TOC_SLOT, '');
  }

  // Build a heading tree using a stack of open ancestors, keyed by level.
  const root = { level: 0, children: [] };
  const stack = [root];
  for (const heading of headings) {
    while (stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(heading);
    stack.push(heading);
  }

  const renderList = (nodes) => {
    if (nodes.length === 0) {
      return '';
    }
    const items = nodes
      .map((node) => `<li><a href="#${node.id}">${node.text}</a>${renderList(node.children)}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  };

  const list = renderList(root.children);
  const html = `<details open><summary>Table of contents</summary><nav aria-label="Table of contents">${list}</nav></details>`;
  return withoutMarker.replace(TOC_SLOT, html);
};
