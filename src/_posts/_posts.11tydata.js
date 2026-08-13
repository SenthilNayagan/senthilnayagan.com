export default {
  layout: 'post',
  tags: ['posts'],
  permalink: (data) => `/blog/${data?.page?.fileSlug}/`,
};
