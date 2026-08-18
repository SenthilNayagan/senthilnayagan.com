import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import * as pagefind from 'pagefind';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

import { extractPostContent, buildMarkdownExport } from './lib/markdownExport.js';
import {
  toISOString,
  toAbsoluteUrl,
  readableDate,
  machineDate,
  readingTime,
  limit,
  publicTags,
  slugifyString,
  rfc822Date,
  newestDate,
} from './lib/filters.js';
import { dir, excludedTags } from './lib/constants.js';
import registerCollections from './lib/collections.js';
import faviconShortcode from './lib/shortcodes/favicon.js';
import { buildToc } from './lib/toc.js';

// Template language for the site: https://www.11ty.dev/docs/languages/liquid/
const TEMPLATE_ENGINE = 'liquid';

/**
 * @type {(eleventyConfig: import('@11ty/eleventy/src/UserConfig').default) => ReturnType<import('@11ty/eleventy/src/defaultConfig')>}
 */
export default (eleventyConfig) => {
  // Watch targets
  eleventyConfig.addWatchTarget('src/assets/styles');

  // giscus loads our custom theme CSS (src/assets/giscus-themes/) with `crossorigin="anonymous"`.
  // In local dev that request hits a second, stricter wall beyond plain CORS: Chrome's Private
  // Network Access (PNA) policy blocks a public origin (https://giscus.app) from fetching a
  // loopback address (localhost) at all unless the preflight explicitly grants it via
  // Access-Control-Allow-Private-Network — confirmed via the exact DevTools error: "blocked by
  // CORS policy: Permission was denied for this request to access the `loopback` address space."
  // PNA only restricts requests TO a loopback/private address, so production (a real domain) was
  // never affected — and GitHub Pages (per the CNAME file) already sends Access-Control-Allow-
  // Origin: * by default there anyway. This is purely a local-dev-testing fix.
  eleventyConfig.setServerOptions({
    middleware: [
      (req, res, next) => {
        if (!req.url.startsWith('/assets/giscus-themes/')) {
          return next();
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Vary', 'Origin');
        if (req.method === 'OPTIONS') {
          // The PNA permission is granted via the preflight response — the static file server
          // further down the middleware chain doesn't know how to answer OPTIONS itself, so this
          // has to short-circuit and respond directly rather than calling next().
          res.statusCode = 204;
          res.end();
          return;
        }
        next();
      },
    ],
  });

  // Plugins
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['webp', 'jpeg'],
    widths: ['auto', 400, 800, 1200],
    outputDir: `${dir.output}/assets/images/posts`,
    urlPath: '/assets/images/posts/',
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '100vw',
    },
  });
  eleventyConfig.addPlugin(syntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });

  // Client-side search (Pagefind): indexes the built site after every build — both `eleventy` and
  // `eleventy --serve` fire this event, so the index stays current in dev too. Only pages that mark a
  // `data-pagefind-body` element (posts, About, Newsletter — see default.liquid) get indexed; once any
  // page uses that attribute, Pagefind indexes only marked pages sitewide, which is how listing/tag/
  // pagination pages end up excluded without needing a separate ignore rule.
  eleventyConfig.on('eleventy.after', async () => {
    const { index } = await pagefind.createIndex({});
    await index.addDirectory({ path: dir.output });
    await index.writeFiles({ outputPath: `${dir.output}/pagefind` });
  });

  // Markdown: add clickable anchor links to headings for easy deep-linking. Uses the same slugify as
  // tags/URLs elsewhere on the site — markdown-it-anchor's own default slugify runs encodeURIComponent
  // on the slug, which bakes literal "%3F"-style escapes into the id attribute for any heading with
  // punctuation (e.g. a "?"). That breaks anything doing `getElementById` from a decoded href, like the
  // TOC scrollspy.
  const markdownLib = markdownIt({ html: true, breaks: false, linkify: true }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
    level: [1, 2, 3, 4],
    slugify: slugifyString,
  });
  eleventyConfig.setLibrary('md', markdownLib);

  // Collections
  registerCollections(eleventyConfig);

  // Custom shortcodes
  eleventyConfig.addShortcode('favicon', faviconShortcode);
  // A pull-quote/callout box, used as {% aside %}...{% endaside %} around a block of Markdown.
  eleventyConfig.addPairedShortcode('aside', (content) => {
    return `<aside role="note" class="post-aside">${markdownLib.render(content.trim())}</aside>`;
  });

  // Builds a table of contents out of the heading anchors left behind by markdown-it-anchor.
  // Runs as a transform (rather than inside the `toc` include) because headings don't exist
  // yet at the point the include tag is substituted, before Markdown has rendered.
  eleventyConfig.addTransform('toc', (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith('.html')) {
      return content;
    }
    return buildToc(content);
  });

  // Generates a sibling `<slug>.md` file for each post — a clean, portable Markdown export of
  // just the article body (absolute image/link URLs, no site chrome), for the "Export as
  // Markdown" icon in components/share.liquid. `.prose` excludes the TOC sidebar by construction
  // (it's a separate element outside .prose), so no extra filtering is needed for that. Runs
  // after `toc` so `.prose` is already clean of the TOC marker comment by the time it's read.
  eleventyConfig.addTransform('markdownExport', async function (content, outputPath) {
    if (!outputPath || !outputPath.endsWith('.html') || !content.includes('class="wrapper post"')) {
      return content;
    }
    const { title, proseHtml } = extractPostContent(content);
    const markdown = buildMarkdownExport({ title, proseHtml, url: this.page.url });
    // Derived from the real outputPath (".../<slug>/index.html" -> ".../<slug>.md"), not the
    // `dir.output` constant — outputPath reflects whatever output directory Eleventy is actually
    // writing to at runtime (which a `--output` CLI flag can override), so this stays correct
    // even if the constant and the real output dir ever diverge.
    const mdOutputPath = outputPath.replace(/[\\/]index\.html$/, '.md');
    await mkdir(dirname(mdOutputPath), { recursive: true });
    await writeFile(mdOutputPath, markdown, 'utf8');
    return content;
  });

  // Custom filters
  eleventyConfig.addFilter('toAbsoluteUrl', toAbsoluteUrl);
  eleventyConfig.addFilter('toIsoString', toISOString);
  eleventyConfig.addFilter('readableDate', readableDate);
  eleventyConfig.addFilter('machineDate', machineDate);
  eleventyConfig.addFilter('readingTime', readingTime);
  eleventyConfig.addFilter('limit', limit);
  eleventyConfig.addFilter('publicTags', (tags) => publicTags(tags, excludedTags));
  eleventyConfig.addFilter('slugify', slugifyString);
  eleventyConfig.addFilter('rfc822Date', rfc822Date);
  eleventyConfig.addFilter('newestDate', newestDate);
  eleventyConfig.addFilter('toJson', JSON.stringify);
  eleventyConfig.addFilter('fromJson', JSON.parse);
  eleventyConfig.addFilter('keys', Object.keys);
  eleventyConfig.addFilter('values', Object.values);
  eleventyConfig.addFilter('entries', Object.entries);

  // Passthrough copy
  eleventyConfig.addPassthroughCopy('src/assets/images');
  eleventyConfig.addPassthroughCopy('src/assets/scripts');
  eleventyConfig.addPassthroughCopy('src/assets/fonts');
  eleventyConfig.addPassthroughCopy('src/assets/giscus-themes');
  eleventyConfig.addPassthroughCopy('CNAME');

  return {
    dir,
    dataTemplateEngine: TEMPLATE_ENGINE,
    markdownTemplateEngine: TEMPLATE_ENGINE,
    htmlTemplateEngine: TEMPLATE_ENGINE,
    templateFormats: ['html', 'md', TEMPLATE_ENGINE],
  };
};
