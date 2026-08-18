import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import domino from '@mixmark-io/domino';
import { toAbsoluteUrl } from './filters.js';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  hr: '---',
});
turndownService.use(gfm);

// markdown-it-anchor's `headerLink` permalink style wraps every heading's text in
// `<a class="header-anchor" href="#slug">` — meaningful for in-page deep-linking, meaningless
// once the heading is lifted out into a standalone Markdown file. Keep the text, drop the link.
turndownService.addRule('stripHeaderAnchor', {
  filter: (node) => node.nodeName === 'A' && node.classList?.contains('header-anchor'),
  replacement: (content) => content,
});

// A file this portable can end up read anywhere, not just on the site — relative links like
// `/blog/other-post/` are meaningless outside that context, so resolve every regular link to an
// absolute URL. `.header-anchor` links are handled (and dropped) by the rule above already.
turndownService.addRule('absolutizeLinks', {
  filter: (node) => node.nodeName === 'A' && !node.classList?.contains('header-anchor'),
  replacement: (content, node) => {
    const href = node.getAttribute('href');
    if (!href) {
      return content;
    }
    return `[${content}](${toAbsoluteUrl(href)})`;
  },
});

// eleventy-img emits a responsive <picture> (multiple <source> candidates + a fallback <img>),
// which turndown has no built-in rule for. Convert the fallback <img> and discard the rest —
// a static Markdown file has no use for responsive srcsets anyway.
turndownService.addRule('picture', {
  filter: 'picture',
  replacement: (_content, node) => {
    const img = node.querySelector('img');
    if (!img) {
      return '';
    }
    const alt = img.getAttribute('alt') || '';
    const src = toAbsoluteUrl(img.getAttribute('src') || '');
    return `![${alt}](${src})`;
  },
});

// <figure>/<figcaption> aren't in turndown's default block-element list, so without an explicit
// rule they can end up mashed inline against the image instead of on their own line.
turndownService.addRule('figure', {
  filter: 'figure',
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});
turndownService.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});

// copy-code.js's inject-a-button-per-code-block markup has no meaning outside the live page.
turndownService.addRule('dropCodeCopyButton', {
  filter: (node) => node.classList?.contains('code-copy'),
  replacement: () => '',
});

/** Extracts a fully-rendered post page's title and its `.prose` element's innerHTML (the article
 * body — excludes the TOC sidebar, header, footer, and share/comment UI, all of which live
 * outside it).
 * @param {string} pageHtml
 */
export const extractPostContent = (pageHtml) => {
  const document = domino.createDocument(pageHtml);
  const title = document.querySelector('.post__title')?.textContent ?? '';
  const prose = document.querySelector('.prose');
  return { title, proseHtml: prose ? prose.innerHTML : '' };
};

// In-article headings on this site intentionally start at h1 (the post title itself is rendered
// outside .prose — see _prose.scss) — correct for the live page, but it means .prose's own
// headings would collide with the exported document's own top-level `# {title}`. Shifting every
// level down by one (h4->h5, ..., h1->h2, processed in that order so an already-shifted h4 isn't
// caught again by the h3->h4 rule) restores a normal single-h1-at-the-top hierarchy.
const shiftHeadingLevelsDown = (html) =>
  html
    .replace(/<(\/?)h4(\s|>)/g, '<$1h5$2')
    .replace(/<(\/?)h3(\s|>)/g, '<$1h4$2')
    .replace(/<(\/?)h2(\s|>)/g, '<$1h3$2')
    .replace(/<(\/?)h1(\s|>)/g, '<$1h2$2');

/** Converts a post's `.prose` HTML into portable, self-contained Markdown (absolute image/link
 * URLs, no site-specific markup) with a title heading and a source-attribution footer.
 * @param {{ title: string, proseHtml: string, url: string }} post
 */
export const buildMarkdownExport = ({ title, proseHtml, url }) => {
  const body = turndownService.turndown(shiftHeadingLevelsDown(proseHtml)).trim();
  const absoluteUrl = toAbsoluteUrl(url);
  return `# ${title}\n\n${body}\n\n---\n\nOriginally published at ${absoluteUrl}\n`;
};
