module.exports = {
  siteMetadata: {
    title: 'DecisionsDev',
    description: 'IBM Decision Open Source Projects',
    keywords: 'IBM, ODM, Decision Manager, Open Source, Automation, Rules Engine, ADS, Decision Intelligence, Automation Decision Service',
    lang: 'en',
  },
  pathPrefix: '/',
  plugins: [
    'gatsby-plugin-image',
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-theme-carbon',
      options: {
        iconPath: './src/images/github-avatar.png',
        theme: {
          homepage: 'dark',
          interior: 'g10',
        },
        titleType: 'append',
        repository: {
          baseUrl: 'https://github.com/DecisionsDev',
          subDirectory: '',
        },
      },
    },
  ],
};

// Made with Bob
