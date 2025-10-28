const config = {
  title: 'Prompt Engineering for Developers',
  tagline: 'Master prompting techniques for software development',
  favicon: 'img/favicon.ico',

  url: 'https://your-gitlab-username.gitlab.io',
  baseUrl: '/prompteng-dev-site/',

  organizationName: 'your-gitlab-username',
  projectName: 'prompteng-dev-site',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    apiEndpoint: process.env.API_ENDPOINT || (process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api/submit' : 'https://performance-tracker-999573668543.asia-south1.run.app/api/submit'),
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://gitlab.com/your-gitlab-username/prompteng-dev-site/-/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Prompt Engineering for Developers',
      items: [
        {
          to: '/',
          label: 'Home',
          position: 'left',
        },
        {
          to: '/docs/assessments',
          label: 'Assessments',
          position: 'left',
        },
        {
          to: '/docs/progress',
          label: 'Progress',
          position: 'left',
        },
        {
          href: 'https://github.com/splunk/prompteng-devs',
          label: 'Course',
          position: 'left',
        },
        {
          href: 'https://gitlab.com/your-gitlab-username/prompteng-dev-site',
          label: 'GitLab',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learning',
          items: [
            {
              label: 'Get Started',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitLab',
              href: 'https://gitlab.com/your-gitlab-username/prompteng-dev-site',
            },
          ],
        },
      ],
      copyright: `Built with ❤️ by Splunk ProdTech Enablement Team`,
    },
    prism: {
      theme: require('prism-react-renderer').themes.github,
      darkTheme: require('prism-react-renderer').themes.dracula,
    },
  },
};

module.exports = config;
