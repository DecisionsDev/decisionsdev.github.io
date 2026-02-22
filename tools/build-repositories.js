#!/usr/bin/env node

/**
 * Build repositories.json with categorization
 * Fetches repos from GitHub and applies categorization logic from topic-analyzer.js
 * Adds a 'categories' field with clean names while preserving original 'topics'
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { analyzeRepository } = require('./topic-analyzer');

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ORG_NAME = 'DecisionsDev';
const OUTPUT_PATH = path.join(__dirname, '../src/data/repositories.json');

// Repositories to exclude from the build
// .github: Special GitHub organization profile repository, not a project repository
// decisionsdev.github.io: This website repository itself
// sample-template_repository: Template repository, not a real project
const EXCLUDED_REPOS = ['.github', 'decisionsdev.github.io', 'sample-template_repository'];

/**
 * Strip prefixes from topic names to get clean category names
 * @param {string} topic - Topic with prefix (e.g., 'product-odm')
 * @returns {string} Clean name (e.g., 'odm')
 */
function stripPrefix(topic) {
  return topic.replace(/^(product|comp|type)-/, '');
}

/**
 * Fetch all repositories from GitHub organization
 * @returns {Promise<Array>} Array of repository objects
 */
function fetchRepositories() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/orgs/${ORG_NAME}/repos?per_page=100`,
      method: 'GET',
      headers: {
        'User-Agent': 'DecisionsDev-Site',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    // Add authentication if token is available
    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API returned status ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const repos = JSON.parse(data);
          resolve(repos);
        } catch (error) {
          reject(new Error(`Failed to parse GitHub response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
}

/**
 * Process repositories and add categorization
 * @param {Array} repos - Raw repository data from GitHub
 * @returns {Array} Processed repositories with categories
 */
function processRepositories(repos) {
  return repos
    .filter(repo => !EXCLUDED_REPOS.includes(repo.name)) // Exclude repositories in EXCLUDED_REPOS list
    .map(repo => {
    // Analyze repository to get suggested categories
    const analysis = analyzeRepository(repo);

    // Build categories object with clean names
    const categories = {
      products: analysis.products.map(stripPrefix),
      components: analysis.components.map(stripPrefix)
    };

    // Return repository with both original topics and new categories
    return {
      name: repo.name,
      description: repo.description,
      topics: repo.topics || [], // Preserve original GitHub topics
      categories: categories,     // Add structured categories with clean names
      url: repo.html_url,
      stars: repo.stargazers_count || 0,  // Add star count
      forks: repo.forks_count || 0,        // Add fork count
      updated_at: repo.updated_at          // Add last updated date
    };
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('Fetching repositories from GitHub...');
    const repos = await fetchRepositories();
    console.log(`Found ${repos.length} repositories`);

    console.log('Processing repositories and applying categorization...');
    const processedRepos = processRepositories(repos);

    // Sort repositories by name
    processedRepos.sort((a, b) => a.name.localeCompare(b.name));

    // Write to file
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedRepos, null, 2));
    console.log(`✓ Successfully wrote ${processedRepos.length} repositories to ${OUTPUT_PATH}`);

    // Print summary statistics
    const stats = {
      withProducts: processedRepos.filter(r => r.categories.products.length > 0).length,
      withComponents: processedRepos.filter(r => r.categories.components.length > 0).length,
      withoutProducts: processedRepos.filter(r => r.categories.products.length === 0).length
    };

    console.log('\nCategorization Summary:');
    console.log(`  Repositories with products: ${stats.withProducts}`);
    console.log(`  Repositories with components: ${stats.withComponents}`);
    console.log(`  Repositories without products (will appear in "Other"): ${stats.withoutProducts}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { fetchRepositories, processRepositories, stripPrefix };

// Made with Bob