#!/usr/bin/env node

/**
 * Script to add structured topics to DecisionsDev GitHub repositories
 * Based on repository name and description analysis
 * 
 * Usage:
 *   node add-topics-to-repos.js --dry-run          # Preview changes without applying
 *   node add-topics-to-repos.js --apply            # Apply changes to GitHub
 *   node add-topics-to-repos.js --repo repo-name   # Process specific repository
 * 
 * Requirements:
 *   - GitHub Personal Access Token with 'repo' scope
 *   - Set as environment variable: GITHUB_TOKEN=your_token_here
 */

const https = require('https');
const { analyzeRepository } = require('./topic-analyzer');

// Configuration
const ORG_NAME = 'DecisionsDev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || !args.includes('--apply');
const specificRepo = args.find(arg => arg.startsWith('--repo='))?.split('=')[1];

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
 * Update topics for a repository
 */
function updateTopics(repoName, topics) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ names: topics });
    
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${ORG_NAME}/${repoName}/topics`,
      method: 'PUT',
      headers: {
        'User-Agent': 'DecisionsDev-Topic-Manager',
        'Accept': 'application/vnd.github.mercy-preview+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to update topics: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
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
async function processRepositories() {
  console.log('🔍 Fetching repositories from DecisionsDev organization...\n');

  try {
    const repos = await fetchRepositories();
    const reposToProcess = specificRepo 
      ? repos.filter(r => r.name === specificRepo)
      : repos;

    if (reposToProcess.length === 0) {
      console.log(`❌ No repositories found${specificRepo ? ` matching: ${specificRepo}` : ''}`);
      return;
    }

    console.log(`📦 Found ${reposToProcess.length} repositories to analyze\n`);
    console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (preview only)' : '✅ APPLY (will update GitHub)'}\n`);
    console.log('═'.repeat(80) + '\n');

    let processedCount = 0;
    let updatedCount = 0;

    for (const repo of reposToProcess) {
      processedCount++;
      console.log(`\n[${processedCount}/${reposToProcess.length}] 📁 ${repo.name}`);
      console.log(`Description: ${repo.description || '(no description)'}`);

      // Analyze repository
      const suggestions = analyzeRepository(repo);
      const suggestedTopics = [
        ...suggestions.products,
        ...suggestions.components,
        ...suggestions.types
      ];

      if (suggestedTopics.length === 0) {
        console.log('⚠️  No structured topics suggested');
        continue;
      }

      // Get current topics
      let currentTopics = [];
      try {
        currentTopics = await getCurrentTopics(repo.name);
      } catch (error) {
        console.log(`⚠️  Could not fetch current topics: ${error.message}`);
      }

      // Merge suggested topics with existing non-structured topics
      const structuredPrefixes = ['product-', 'comp-', 'type-'];
      const existingNonStructured = currentTopics.filter(
        t => !structuredPrefixes.some(prefix => t.startsWith(prefix))
      );
      const newTopics = [...new Set([...suggestedTopics, ...existingNonStructured])];

      // Show suggestions with confidence scores
      console.log('\n📊 Suggested structured topics:');
      for (const topic of suggestedTopics) {
        const conf = suggestions.confidence[topic];
        console.log(`   • ${topic} (confidence: ${conf.score.toFixed(1)}, matches: ${conf.matches.join(', ')})`);
      }

      console.log('\n📋 Current topics:', currentTopics.length > 0 ? currentTopics.join(', ') : '(none)');
      console.log('🎯 Proposed topics:', newTopics.join(', '));

      // Check if update is needed
      const topicsChanged = JSON.stringify([...currentTopics].sort()) !== JSON.stringify([...newTopics].sort());

      if (!topicsChanged) {
        console.log('✓ No changes needed');
        continue;
      }

      if (isDryRun) {
        console.log('🔍 DRY RUN: Would update topics');
      } else {
        if (!GITHUB_TOKEN) {
          console.log('❌ Cannot apply: GITHUB_TOKEN not set');
          continue;
        }

        try {
          await updateTopics(repo.name, newTopics);
          console.log('✅ Topics updated successfully');
          updatedCount++;
          
          // Rate limiting: wait 1 second between updates
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`❌ Failed to update: ${error.message}`);
        }
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Processed: ${processedCount} repositories`);
    if (!isDryRun) {
      console.log(`   Updated: ${updatedCount} repositories`);
    }
    console.log(`\n${isDryRun ? '💡 Run with --apply to update GitHub repositories' : '✅ Done!'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Validate environment
if (!isDryRun && !GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required for --apply mode');
  console.error('💡 Set it with: export GITHUB_TOKEN=your_token_here');
  console.error('💡 Or run in dry-run mode: node add-topics-to-repos.js --dry-run');
  process.exit(1);
}

// Run the script
processRepositories().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Made with Bob
