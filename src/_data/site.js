export default {
  title: 'Senthil Nayagan',
  shortTitle: 'Senthil Nayagan',
  author: 'Senthil Nayagan',
  email: 'senthil.nayagan@gmail.com',
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
  nav: [
    { text: 'Home', url: '/' },
    { text: 'Blog', url: '/blog/' },
    { text: 'Tags', url: '/tags/' },
    { text: 'About', url: '/about/' },
  ],
  url: process.env.ELEVENTY_ENV === 'development' ? 'http://localhost:8080' : 'https://senthilnayagan.com',
};
