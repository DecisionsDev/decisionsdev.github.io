module.exports = {
  siteMetadata: {
    title: 'DecisionsDev',
    description: 'IBM Decision Open Source Projects',
    keywords: 'IBM, ODM, Decision Manager, Open Source, Automation, Rules Engine, ADS, Decision Intelligence, Automation Decision Service',
    lang: 'en',
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: 'gatsby-theme-carbon',
      options: {
        iconPath: './src/images/favicon.svg',
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
