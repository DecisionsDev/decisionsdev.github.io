#!/usr/bin/env node

/**
 * Script to list all topics used across DecisionsDev GitHub repositories
 * 
 * Usage:
 *   node list-all-topics.js                    # List all topics with counts
 *   node list-all-topics.js --sort-alpha       # Sort alphabetically
 *   node list-all-topics.js --sort-count       # Sort by usage count (default)
 *   node list-all-topics.js --pattern "prod*"  # Filter by pattern
 * 
 * Requirements:
 *   - GitHub Personal Access Token (optional, but recommended for higher rate limits)
 *   - Set as environment variable: GITHUB_TOKEN=your_token_here
 */

const https = require('https');

// Configuration
const ORG_NAME = 'DecisionsDev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Parse command line arguments
const args = process.argv.slice(2);
const sortAlpha = args.includes('--sort-alpha');
const sortCount = args.includes('--sort-count') || !sortAlpha;
const patternArg = args.find(arg => arg.startsWith('--pattern='))?.split('=')[1];

/**
 * Check if a topic matches the filter pattern
 */
function matchesPattern(topic, pattern) {
  if (!pattern) return true;
  
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(topic);
}

/**
 * Get current topics from a repository
 */
function getCurrentTopics(repoName) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'DecisionsDev-Topic-Manager',
      'Accept': 'application/vnd.github.mercy-preview+json'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const options = {
      hostname: 'api.github.com',
      path: `/repos/${ORG_NAME}/${repoName}/topics`,
      method: 'GET',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).names || []);
        } else {
          reject(new Error(`Failed to get topics: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Fetch all repositories from the organization
 */
function fetchRepositories() {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'DecisionsDev-Topic-Manager',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const options = {
      hostname: 'api.github.com',
      path: `/orgs/${ORG_NAME}/repos?per_page=100`,
      method: 'GET',
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch repos: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Main processing function
 */
async function listAllTopics() {
  console.log('🔍 Fetching repositories from DecisionsDev organization...\n');

  try {
    const repos = await fetchRepositories();
    console.log(`📦 Found ${repos.length} repositories\n`);
    console.log('📊 Analyzing topics...\n');

    // Collect all topics with their usage
    const topicUsage = new Map(); // topic -> { count, repos: [] }
    let reposWithTopics = 0;
    let reposWithoutTopics = 0;

    for (const repo of repos) {
      try {
        const topics = await getCurrentTopics(repo.name);
        
        if (topics.length > 0) {
          reposWithTopics++;
          for (const topic of topics) {
            if (!topicUsage.has(topic)) {
              topicUsage.set(topic, { count: 0, repos: [] });
            }
            const usage = topicUsage.get(topic);
            usage.count++;
            usage.repos.push(repo.name);
          }
        } else {
          reposWithoutTopics++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`⚠️  Error fetching topics for ${repo.name}: ${error.message}`);
      }
    }

    // Filter by pattern if specified
    let filteredTopics = Array.from(topicUsage.entries());
    if (patternArg) {
      filteredTopics = filteredTopics.filter(([topic]) => matchesPattern(topic, patternArg));
    }

    // Sort topics
    if (sortAlpha) {
      filteredTopics.sort((a, b) => a[0].localeCompare(b[0]));
    } else {
      // Sort by count (descending), then alphabetically
      filteredTopics.sort((a, b) => {
        if (b[1].count !== a[1].count) {
          return b[1].count - a[1].count;
        }
        return a[0].localeCompare(b[0]);
      });
    }

    // Display results
    console.log('═'.repeat(80));
    console.log('\n📋 ALL TOPICS USED IN DECISIONSDEV:\n');
    
    if (filteredTopics.length === 0) {
      console.log('No topics found' + (patternArg ? ` matching pattern: ${patternArg}` : ''));
    } else {
      // Group by category
      const categories = {
        'Product Topics': [],
        'Component Topics': [],
        'Type Topics': [],
        'Other Topics': []
      };

      for (const [topic, usage] of filteredTopics) {
        if (topic.startsWith('product-')) {
          categories['Product Topics'].push([topic, usage]);
        } else if (topic.startsWith('comp-')) {
          categories['Component Topics'].push([topic, usage]);
        } else if (topic.startsWith('type-')) {
          categories['Type Topics'].push([topic, usage]);
        } else {
          categories['Other Topics'].push([topic, usage]);
        }
      }

      // Display by category
      for (const [category, topics] of Object.entries(categories)) {
        if (topics.length > 0) {
          console.log(`\n${category}:`);
          console.log('─'.repeat(80));
          for (const [topic, usage] of topics) {
            console.log(`  ${topic.padEnd(40)} (${usage.count} repos)`);
          }
        }
      }

      // Display detailed usage if requested
      if (args.includes('--verbose') || args.includes('-v')) {
        console.log('\n\n📖 DETAILED USAGE:\n');
        console.log('─'.repeat(80));
        for (const [topic, usage] of filteredTopics) {
          console.log(`\n${topic} (${usage.count} repos):`);
          console.log(`  ${usage.repos.join(', ')}`);
        }
      }
    }

    // Summary statistics
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 SUMMARY:\n');
    console.log(`  Total unique topics: ${topicUsage.size}`);
    if (patternArg) {
      console.log(`  Filtered topics: ${filteredTopics.length}`);
    }
    console.log(`  Repositories with topics: ${reposWithTopics}`);
    console.log(`  Repositories without topics: ${reposWithoutTopics}`);
    console.log(`  Total repositories: ${repos.length}`);
    
    if (topicUsage.size > 0) {
      const avgTopicsPerRepo = Array.from(topicUsage.values())
        .reduce((sum, usage) => sum + usage.count, 0) / reposWithTopics;
      console.log(`  Average topics per repo (with topics): ${avgTopicsPerRepo.toFixed(1)}`);
    }

    console.log('\n💡 TIP: Use --verbose or -v to see which repositories use each topic');
    console.log('💡 TIP: Use --pattern "product-*" to filter topics by pattern');
    console.log('💡 TIP: Use --sort-alpha to sort alphabetically instead of by count\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
listAllTopics().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Made with Bob