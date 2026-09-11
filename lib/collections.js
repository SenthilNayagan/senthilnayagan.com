import { excludedTags } from './constants.js';

/** Registers custom Eleventy collections.
 * @param {import('@11ty/eleventy/src/UserConfig').default} eleventyConfig
 */
export default function (eleventyConfig) {
  const published = (post) => !post.data.unlisted;

  // All posts, newest first (Eleventy sorts ascending by date by default).
  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi.getFilteredByTag('posts').filter(published).reverse();
  });

  // Posts flagged with `featured: true` in their front matter, newest first.
  eleventyConfig.addCollection('featuredPosts', (collectionApi) => {
    return collectionApi
      .getFilteredByTag('posts')
      .filter(published)
      .filter((post) => post.data.featured)
      .reverse();
  });

  // Non-featured posts, newest first. Used on the homepage so a featured post doesn't also show up
  // a second time under "Recent posts" (which, among other things, would create a duplicate
  // view-transition-name on the page and silently disable the post-click transition).
  eleventyConfig.addCollection('recentPosts', (collectionApi) => {
    return collectionApi
      .getFilteredByTag('posts')
      .filter(published)
      .filter((post) => !post.data.featured)
      .reverse();
  });

  // Unique, publicly listed tags across all posts, derived from the posts collection.
  // Pattern used throughout the 11ty community/docs: https://www.11ty.dev/docs/quicktips/tag-lists/
  eleventyConfig.addCollection('tagList', (collectionApi) => {
    const tagsWithDupes = collectionApi.getFilteredByTag('posts').filter(published).flatMap((post) => post.data.tags || []);
    const uniqueTags = new Set(tagsWithDupes.filter((tag) => !excludedTags.includes(tag)));
    return [...uniqueTags].sort((a, b) => a.localeCompare(b));
  });

  // Unique category paths across all posts, at every depth — a post filed under Programming/Rust
  // contributes both "Programming" and "Programming/Rust", so the parent category page also lists
  // posts from its subcategories. `category` comes from each post's folder location under
  // src/_posts/ (see src/_posts/_posts.11tydata.js), not from explicit front matter.
  eleventyConfig.addCollection('categoryList', (collectionApi) => {
    const paths = new Set();
    collectionApi.getFilteredByTag('posts').filter(published).forEach((post) => {
      const category = post.data.category || [];
      for (let depth = 1; depth <= category.length; depth++) {
        paths.add(category.slice(0, depth).join('/'));
      }
    });
    return [...paths].sort((a, b) => a.localeCompare(b));
  });
}
