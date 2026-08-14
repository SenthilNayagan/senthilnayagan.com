import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import { eleventyImageTransformPlugin } from '@11ty/eleventy-img';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

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
  eleventyConfig.addPassthroughCopy('CNAME');

  return {
    dir,
    dataTemplateEngine: TEMPLATE_ENGINE,
    markdownTemplateEngine: TEMPLATE_ENGINE,
    htmlTemplateEngine: TEMPLATE_ENGINE,
    templateFormats: ['html', 'md', TEMPLATE_ENGINE],
  };
};
