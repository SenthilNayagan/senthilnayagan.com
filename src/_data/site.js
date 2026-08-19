export default {
  title: 'Senthil Nayagan',
  shortTitle: 'Senthil Nayagan',
  author: 'Senthil Nayagan',
  email: 'hello@senthilnayagan.com',
  description: 'Senthil Nayagan writes about software engineering, web development, and technology.',
  keywords: ['Senthil Nayagan', 'software engineering', 'web development', 'programming', 'tech blog'],
  language: 'en-US',
  newsletterUrl: 'https://buttondown.com/senthilnayagan',
  // Empty in development so local/author visits never get tracked or count toward real traffic.
  googleAnalyticsId: process.env.ELEVENTY_ENV === 'development' ? '' : 'G-H2FX392X8T',
  cookieConsentMessage:
    'This site uses cookies to understand how visitors read and navigate it, via Google Analytics. See the Privacy Policy for details.',
  favicon: {
    widths: [32, 57, 76, 96, 128, 192, 228],
    format: 'png',
  },
  social: {
    github: 'https://github.com/senthilnayagan',
    linkedin: '',
    twitter: '',
  },
  // Reader comments on blog posts, via giscus (github.com/giscus/giscus) backed by GitHub Discussions.
  // repoId/categoryId come from https://giscus.app once Discussions is enabled and the giscus app is
  // installed on the repo — see src/_includes/components/comments.liquid for setup steps.
  //
  // Category is "General", not the recommended "Announcements" — giscus currently can't create new
  // discussions in an Announcement-type category ("Unable to create discussion" on first comment,
  // confirmed by multiple reports: https://github.com/giscus/giscus/issues/1323). Revisit if that
  // ever gets fixed upstream.
  giscus: {
    repo: 'SenthilNayagan/senthilnayagan.com',
    repoId: 'R_kgDOLfinTQ',
    category: 'General',
    categoryId: 'DIC_kwDOLfinTc4DDcms',
  },
  nav: [
    { text: 'Home', url: '/' },
    { text: 'Blog', url: '/blog/' },
    { text: 'Tags', url: '/tags/' },
    { text: 'About Me', url: '/about-me/' },
  ],
  // SITE_URL overrides both branches below — an escape hatch for tunneling the dev server (e.g.
  // through cloudflared) to a real public URL. Needed whenever testing something Chrome's Private
  // Network Access policy blocks when the site's own origin is a loopback address like localhost
  // (see the giscus theme CORS/PNA setup in .eleventy.js and comments.liquid) — unset by default,
  // so it has no effect on normal dev/prod builds.
  url:
    process.env.SITE_URL ||
    (process.env.ELEVENTY_ENV === 'development' ? 'http://localhost:8080' : 'https://senthilnayagan.com'),
};
