#!/usr/bin/env node

/**
 * Script to remove "decision-center" topic from specific repositories where it was just added
 * This is a one-time undo script for the accidental decision-center topic addition
 */

const https = require('https');

// Configuration
const ORG_NAME = 'DecisionsDev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Repositories where decision-center was just added (from the log)
const REPOS_TO_FIX = [
  'odm-ondocker',
  'odm-docker-kubernetes',
  'decisionsdev.github.io',
  'sample-template_repository',
  'sample-blockchain-vehicle-lifecycle',
  'odm-decision-forms',
  'odm-dsi-docker',
  'odm-rpa-invoicing-sample',
  'odm-rpa-decisionbot-tutorial'
];

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || !args.includes('--apply');

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
 * Main processing function
 */
async function undoDecisionCenterAddition() {
  console.log('🔄 Undoing accidental "decision-center" topic addition...\n');
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (preview only)' : '✅ APPLY (will update GitHub)'}\n`);
  console.log(`📦 Processing ${REPOS_TO_FIX.length} repositories\n`);
  console.log('═'.repeat(80) + '\n');

  let processedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const repoName of REPOS_TO_FIX) {
    processedCount++;
    
    try {
      const currentTopics = await getCurrentTopics(repoName);
      
      if (!currentTopics.includes('decision-center')) {
        console.log(`[${processedCount}/${REPOS_TO_FIX.length}] ⏭️  ${repoName} - decision-center not found, skipping`);
        skippedCount++;
        continue;
      }

      const newTopics = currentTopics.filter(topic => topic !== 'decision-center');
      
      console.log(`\n[${processedCount}/${REPOS_TO_FIX.length}] 📁 ${repoName}`);
      console.log(`📋 Current topics: ${currentTopics.join(', ')}`);
      console.log(`🗑️  Removing: decision-center`);
      console.log(`🎯 New topics: ${newTopics.length > 0 ? newTopics.join(', ') : '(none)'}`);

      if (isDryRun) {
        console.log('🔍 DRY RUN: Would remove decision-center');
      } else {
        if (!GITHUB_TOKEN) {
          console.log('❌ Cannot apply: GITHUB_TOKEN not set');
          continue;
        }

        try {
          await updateTopics(repoName, newTopics);
          console.log('✅ decision-center removed successfully');
          updatedCount++;
          
          // Rate limiting: wait 1 second between updates
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.log(`❌ Failed to update: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`\n[${processedCount}/${REPOS_TO_FIX.length}] ❌ ${repoName} - Error: ${error.message}`);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${processedCount} repositories`);
  console.log(`   Skipped (no decision-center): ${skippedCount} repositories`);
  if (!isDryRun) {
    console.log(`   Updated: ${updatedCount} repositories`);
  }
  console.log(`\n${isDryRun ? '💡 Run with --apply to update GitHub repositories' : '✅ Done!'}`);
}

// Validate environment
if (!isDryRun && !GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required for --apply mode');
  console.error('💡 Set it with: $env:GITHUB_TOKEN="your_token_here" (PowerShell)');
  console.error('              or: export GITHUB_TOKEN="your_token_here" (Bash)');
  process.exit(1);
}

// Run the script
undoDecisionCenterAddition().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Made with Bob