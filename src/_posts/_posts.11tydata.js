export default {
  layout: 'post',
  tags: ['posts'],
  permalink: (data) => `/blog/${data?.page?.fileSlug}/`,
  eleventyComputed: {
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
