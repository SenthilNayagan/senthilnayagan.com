export default {
  layout: 'post',
  tags: ['posts'],
  permalink: (data) => `/blog/${data?.page?.fileSlug}/`,
  eleventyComputed: {
    // unlisted: true hides the post from all listings (blog page, tag pages, category pages,
    // RSS feed, sitemap) while still building it at its URL — useful for posts you want
    // accessible by direct link but not surfaced anywhere. Unlike draft: true, which keeps
    // the post visible with a work-in-progress banner, unlisted: true makes it invisible
    // to all collections.
    eleventyExcludeFromCollections: (data) => data?.unlisted === true,
    excludeFromSitemap: (data) => data?.unlisted === true,
    // Breadcrumb category, derived purely from where the post's folder sits under src/_posts/ — e.g.
    // src/_posts/Programming/Rust/some-post/index.md becomes ["Programming", "Rust"]. A post left
    // directly in src/_posts/ (no subfolder) gets an empty array, so no breadcrumb renders for it.
    // Doesn't affect the URL above, which is keyed on fileSlug (the post's own folder name) only.
    category: (data) => {
      const inputPath = (data?.page?.inputPath ?? '').replace(/\\/g, '/');
      const marker = '/_posts/';
      const afterMarker = inputPath.indexOf(marker);
      if (afterMarker === -1) return [];
      const parts = inputPath.slice(afterMarker + marker.length).split('/');
      parts.pop(); // index.md
      parts.pop(); // the post's own folder (== fileSlug)
      return parts;
    },
  },
};
