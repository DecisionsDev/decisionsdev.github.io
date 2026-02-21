const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/orgs/DecisionsDev/repos?per_page=100',
  method: 'GET',
  headers: {
    'User-Agent': 'DecisionsDev-Site',
    'Accept': 'application/vnd.github.v3+json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const repos = JSON.parse(data);
    const repoData = repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      topics: repo.topics,
      url: repo.html_url
    }));
    console.log(JSON.stringify(repoData, null, 2));
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();

// Made with Bob
