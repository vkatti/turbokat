// Site-wide settings. Edit links and text here; no code changes needed.
export default {
  title: 'Vishal Katti',
  url: 'https://vishalkatti.com',
  description:
    'Vishal Katti writes about R, Python, Excel and the ideas behind everyday data work.',
  author: 'Vishal Katti',
  twitter: '@vishal_katti',
  language: 'en',

  // Utterances comments (GitHub issues). Set to null to turn comments off.
  comments: { repo: 'vkatti/turbokat', issueTerm: 'pathname', label: 'comments 💬' },

  nav: [
    { text: 'Blog', href: '/blog/' },
    { text: 'About', href: '/about/' },
  ],

  social: [
    { name: 'GitHub', icon: 'github', href: 'https://github.com/vkatti' },
    { name: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/vishalkatti' },
    { name: 'X / Twitter', icon: 'x-twitter', href: 'https://twitter.com/vishal_katti' },
    { name: 'Mastodon', icon: 'mastodon', href: 'https://fosstodon.org/@vishalkatti', rel: 'me' },
  ],
};
