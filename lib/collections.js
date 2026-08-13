import { excludedTags } from './constants.js';

/** Registers custom Eleventy collections.
 * @param {import('@11ty/eleventy/src/UserConfig').default} eleventyConfig
 */
export default function (eleventyConfig) {
  // All posts, newest first (Eleventy sorts ascending by date by default).
  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi.getFilteredByTag('posts').reverse();
  });

  // Posts flagged with `featured: true` in their front matter, newest first.
  eleventyConfig.addCollection('featuredPosts', (collectionApi) => {
    return collectionApi
      .getFilteredByTag('posts')
      .filter((post) => post.data.featured)
      .reverse();
  });

  // Non-featured posts, newest first. Used on the homepage so a featured post doesn't also show up
  // a second time under "Recent posts" (which, among other things, would create a duplicate
  // view-transition-name on the page and silently disable the post-click transition).
  eleventyConfig.addCollection('recentPosts', (collectionApi) => {
    return collectionApi
      .getFilteredByTag('posts')
      .filter((post) => !post.data.featured)
      .reverse();
  });

  // Unique, publicly listed tags across all posts, derived from the posts collection.
  // Pattern used throughout the 11ty community/docs: https://www.11ty.dev/docs/quicktips/tag-lists/
  eleventyConfig.addCollection('tagList', (collectionApi) => {
    const tagsWithDupes = collectionApi.getFilteredByTag('posts').flatMap((post) => post.data.tags || []);
    const uniqueTags = new Set(tagsWithDupes.filter((tag) => !excludedTags.includes(tag)));
    return [...uniqueTags].sort((a, b) => a.localeCompare(b));
  });
}
