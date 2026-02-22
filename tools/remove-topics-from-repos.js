#!/usr/bin/env node

/**
 * Script to remove and optionally replace topics in DecisionsDev GitHub repositories
 *
 * Usage:
 *   node remove-topics-from-repos.js --topics topic1,topic2 --dry-run           # Preview removal
 *   node remove-topics-from-repos.js --topics topic1,topic2 --apply             # Apply removal
 *   node remove-topics-from-repos.js --topics topic1 --repo repo-name           # Specific repo
 *   node remove-topics-from-repos.js --pattern "product-*" --dry-run            # Remove by pattern
 *   node remove-topics-from-repos.js --topics old1,old2 --replace new1,new2    # Replace topics
 *   node remove-topics-from-repos.js --pattern "odmdev-*" --replace odm         # Replace pattern with single topic
 *
 * Requirements:
 *   - GitHub Personal Access Token with 'repo' scope
 *   - Set as environment variable: GITHUB_TOKEN=your_token_here
 */

const https = require('https');

// Configuration
const ORG_NAME = 'DecisionsDev';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || !args.includes('--apply');

// Helper function to get argument value (supports both --arg=value and --arg value)
function getArgValue(argName) {
  const withEquals = args.find(arg => arg.startsWith(`${argName}=`));
  if (withEquals) {
    return withEquals.split('=')[1];
  }
  const argIndex = args.indexOf(argName);
  if (argIndex !== -1 && argIndex + 1 < args.length) {
    return args[argIndex + 1];
  }
  return null;
}

const specificRepo = getArgValue('--repo');
// Support both --topics and --topic (singular)
const topicsArg = getArgValue('--topics') || getArgValue('--topic');
const patternArg = getArgValue('--pattern');
const replaceArg = getArgValue('--replace');

// Parse topics to remove and replace
const topicsToRemove = topicsArg ? topicsArg.split(',').map(t => t.trim().toLowerCase()) : [];
const replacementTopics = replaceArg ? replaceArg.split(',').map(t => t.trim().toLowerCase()) : [];

/**
 * Check if a topic matches the removal pattern
 */
function matchesPattern(topic, pattern) {
  if (!pattern) return false;
  
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
  // Validate input
  if (topicsToRemove.length === 0 && !patternArg && replacementTopics.length === 0) {
    console.error('❌ Error: You must specify topics to remove using --topics or --pattern');
    console.error('💡 Examples:');
    console.error('   node remove-topics-from-repos.js --topics odm,bai --dry-run');
    console.error('   node remove-topics-from-repos.js --pattern "product-*" --dry-run');
    console.error('   node remove-topics-from-repos.js --topics old --replace new --dry-run  # Replace topics');
    process.exit(1);
  }

  // Validation: --replace without --topics/--pattern is not allowed (add-only mode disabled)
  if (replacementTopics.length > 0 && topicsToRemove.length === 0 && !patternArg) {
    // Check if user provided unrecognized arguments that might be typos
    const recognizedArgs = ['--dry-run', '--apply', '--repo', '--topics', '--topic', '--pattern', '--replace'];
    const unrecognizedArgs = args.filter(arg => {
      if (!arg.startsWith('--')) return false;
      const argName = arg.split('=')[0];
      return !recognizedArgs.includes(argName) && !recognizedArgs.some(recognized => arg.startsWith(recognized));
    });
    
    if (unrecognizedArgs.length > 0) {
      console.error(`\n⚠️  WARNING: Unrecognized arguments detected: ${unrecognizedArgs.join(', ')}`);
      console.error('❌ When using --replace, you must also specify --topics or --pattern to indicate what to replace.');
      console.error('💡 Did you mean:');
      console.error(`   --topics instead of ${unrecognizedArgs[0]}?`);
    } else {
      console.error('\n❌ Error: --replace requires --topics or --pattern to specify what to replace.');
      console.error('💡 Adding topics to all repositories is not supported.');
    }
    
    console.error('\n📋 Valid usage:');
    console.error('   --topics "topic1,topic2"  : Topics to remove');
    console.error('   --topic "topic"           : Single topic to remove (alias for --topics)');
    console.error('   --pattern "prefix-*"      : Pattern to match topics');
    console.error('   --replace "new1,new2"     : Replacement topics (requires --topics or --pattern)');
    console.error('   --repo "repo-name"        : Target specific repository');
    console.error('   --dry-run                 : Preview changes');
    console.error('   --apply                   : Apply changes');
    console.error('\n💡 Examples:');
    console.error('   node remove-topics-from-repos.js --topics old-topic --replace new-topic --dry-run');
    console.error('   node remove-topics-from-repos.js --pattern "odmdev-*" --replace odm --dry-run');
    console.error('   node remove-topics-from-repos.js --topics topic1,topic2 --dry-run  # Remove only');
    process.exit(1);
  }

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

    console.log(`📦 Found ${reposToProcess.length} repositories to process\n`);
    console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (preview only)' : '✅ APPLY (will update GitHub)'}\n`);
    
    if (topicsToRemove.length > 0) {
      console.log(`🎯 Topics to remove: ${topicsToRemove.join(', ')}`);
    }
    if (patternArg) {
      console.log(`🎯 Pattern to match: ${patternArg}`);
    }
    if (replacementTopics.length > 0) {
      console.log(`➕ Replacement topics: ${replacementTopics.join(', ')}`);
    }
    
    // Test token permissions if not in dry-run mode
    if (!isDryRun && GITHUB_TOKEN) {
      console.log('\n🔐 Testing GitHub token permissions...');
      try {
        // Try to get topics from the first repo to test permissions
        const testRepo = reposToProcess[0];
        await getCurrentTopics(testRepo.name);
        console.log('✅ Token has read access');
        
        // Note: We can't test write access without actually modifying something,
        // but we'll provide helpful error messages if it fails
      } catch (error) {
        if (error.message.includes('403')) {
          console.error('\n❌ ERROR: GitHub token does not have sufficient permissions!');
          console.error('\n📋 To fix this, create a new Personal Access Token with these permissions:');
          console.error('   1. Go to: https://github.com/settings/tokens');
          console.error('   2. Click "Generate new token (classic)"');
          console.error('   3. Select the "repo" scope (Full control of private repositories)');
          console.error('   4. Generate and copy the token');
          console.error('   5. Set it: $env:GITHUB_TOKEN="your_token_here" (PowerShell)');
          console.error('              export GITHUB_TOKEN="your_token_here" (Bash)');
          console.error('\n💡 The token needs full "repo" scope to modify repository topics.\n');
          process.exit(1);
        }
        throw error;
      }
    }
    
    console.log('\n' + '═'.repeat(80) + '\n');

    let processedCount = 0;
    let updatedCount = 0;
    let totalRemoved = 0;
    let totalAdded = 0;
    let permissionErrors = 0;

    for (const repo of reposToProcess) {
      processedCount++;

      // Get current topics
      let currentTopics = [];
      try {
        currentTopics = await getCurrentTopics(repo.name);
      } catch (error) {
        console.log(`\n[${processedCount}/${reposToProcess.length}] 📁 ${repo.name}`);
        console.log(`⚠️  Could not fetch current topics: ${error.message}`);
        continue;
      }

      if (currentTopics.length === 0) {
        // Only add replacements if we're in "add-only" mode (no topics/pattern specified)
        if (replacementTopics.length > 0 && topicsToRemove.length === 0 && !patternArg) {
          console.log(`\n[${processedCount}/${reposToProcess.length}] 📁 ${repo.name}`);
          console.log('ℹ️  Repository has no topics');
          console.log(`➕ Topics to add: ${replacementTopics.join(', ')}`);
          console.log(`🎯 New topics: ${replacementTopics.join(', ')}`);
          
          if (isDryRun) {
            console.log('🔍 DRY RUN: Would add topics');
            totalAdded += replacementTopics.length;
          } else {
            if (!GITHUB_TOKEN) {
              console.log('❌ Cannot apply: GITHUB_TOKEN not set');
              continue;
            }
            
            try {
              await updateTopics(repo.name, replacementTopics);
              console.log('✅ Topics added successfully');
              updatedCount++;
              totalAdded += replacementTopics.length;
              
              // Rate limiting: wait 1 second between updates
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              if (error.message.includes('403') && error.message.includes('not accessible by personal access token')) {
                console.log(`❌ Permission denied: Token lacks 'repo' scope`);
                permissionErrors++;
              } else {
                console.log(`❌ Failed to update: ${error.message}`);
              }
            }
          }
        }
        // Skip silently - no topics to remove and not in add-only mode
        continue;
      }

      // Determine which topics to remove
      const topicsToRemoveFromRepo = currentTopics.filter(topic => {
        const matchesList = topicsToRemove.includes(topic.toLowerCase());
        const matchesPatternResult = patternArg && matchesPattern(topic, patternArg);
        return matchesList || matchesPatternResult;
      });

      if (topicsToRemoveFromRepo.length === 0) {
        // When using --replace, only add replacements if we're NOT trying to remove specific topics
        // (i.e., only when using --replace without --topics or --pattern)
        if (replacementTopics.length > 0 && topicsToRemove.length === 0 && !patternArg) {
          const topicsToAdd = replacementTopics.filter(
            topic => !currentTopics.includes(topic)
          );
          
          if (topicsToAdd.length > 0) {
            console.log(`\n[${processedCount}/${reposToProcess.length}] 📁 ${repo.name}`);
            console.log(`📋 Current topics: ${currentTopics.join(', ')}`);
            const newTopics = [...currentTopics, ...topicsToAdd];
            console.log(`➕ Topics to add: ${topicsToAdd.join(', ')}`);
            console.log(`🎯 New topics: ${newTopics.join(', ')}`);
            
            if (isDryRun) {
              console.log('🔍 DRY RUN: Would add topics');
              totalAdded += topicsToAdd.length;
            } else {
              if (!GITHUB_TOKEN) {
                console.log('❌ Cannot apply: GITHUB_TOKEN not set');
                continue;
              }
              
              try {
                await updateTopics(repo.name, newTopics);
                console.log('✅ Topics added successfully');
                updatedCount++;
                totalAdded += topicsToAdd.length;
                
                // Rate limiting: wait 1 second between updates
                await new Promise(resolve => setTimeout(resolve, 1000));
              } catch (error) {
                if (error.message.includes('403') && error.message.includes('not accessible by personal access token')) {
                  console.log(`❌ Permission denied: Token lacks 'repo' scope`);
                  permissionErrors++;
                } else {
                  console.log(`❌ Failed to update: ${error.message}`);
                }
              }
            }
          }
          // Skip silently if replacement topics already present
        }
        // Skip silently if no matching topics to remove
        continue;
      }

      // Print repo header only when there's something to do
      console.log(`\n[${processedCount}/${reposToProcess.length}] 📁 ${repo.name}`);
      console.log(`📋 Current topics: ${currentTopics.join(', ')}`);

      // Calculate new topics (remove old, add replacements)
      let newTopics = currentTopics.filter(
        topic => !topicsToRemoveFromRepo.includes(topic)
      );
      
      // Add replacement topics if specified
      if (replacementTopics.length > 0) {
        // Only add replacements that aren't already present
        const topicsToAdd = replacementTopics.filter(
          topic => !newTopics.includes(topic)
        );
        newTopics = [...newTopics, ...topicsToAdd];
        
        if (topicsToAdd.length > 0) {
          console.log(`🗑️  Topics to remove: ${topicsToRemoveFromRepo.join(', ')}`);
          console.log(`➕ Topics to add: ${topicsToAdd.join(', ')}`);
          console.log(`🎯 New topics: ${newTopics.join(', ')}`);
          totalAdded += topicsToAdd.length;
        } else {
          console.log(`🗑️  Topics to remove: ${topicsToRemoveFromRepo.join(', ')}`);
          console.log(`ℹ️  Replacement topics already present`);
          console.log(`🎯 New topics: ${newTopics.join(', ')}`);
        }
      } else {
        console.log(`🗑️  Topics to remove: ${topicsToRemoveFromRepo.join(', ')}`);
        console.log(`🎯 New topics: ${newTopics.length > 0 ? newTopics.join(', ') : '(none)'}`);
      }

      if (isDryRun) {
        console.log(`🔍 DRY RUN: Would ${replacementTopics.length > 0 ? 'replace' : 'remove'} topics`);
        totalRemoved += topicsToRemoveFromRepo.length;
      } else {
        if (!GITHUB_TOKEN) {
          console.log('❌ Cannot apply: GITHUB_TOKEN not set');
          continue;
        }

        try {
          await updateTopics(repo.name, newTopics);
          console.log(`✅ Topics ${replacementTopics.length > 0 ? 'replaced' : 'removed'} successfully`);
          updatedCount++;
          totalRemoved += topicsToRemoveFromRepo.length;
          
          // Rate limiting: wait 1 second between updates
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          if (error.message.includes('403') && error.message.includes('not accessible by personal access token')) {
            console.log(`❌ Permission denied: Token lacks 'repo' scope`);
            permissionErrors++;
          } else {
            console.log(`❌ Failed to update: ${error.message}`);
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Processed: ${processedCount} repositories`);
    console.log(`   Topics removed: ${totalRemoved}`);
    if (replacementTopics.length > 0 && totalAdded > 0) {
      console.log(`   Topics added: ${totalAdded}`);
    }
    if (!isDryRun) {
      console.log(`   Updated: ${updatedCount} repositories`);
      if (permissionErrors > 0) {
        console.log(`   Permission errors: ${permissionErrors} repositories`);
      }
    }
    
    if (permissionErrors > 0) {
      console.log('\n⚠️  PERMISSION ERRORS DETECTED!');
      console.log('\n📋 Your GitHub token does not have the required permissions.');
      console.log('   To fix this, create a new Personal Access Token:');
      console.log('   1. Go to: https://github.com/settings/tokens');
      console.log('   2. Click "Generate new token (classic)"');
      console.log('   3. Select the "repo" scope (Full control of private repositories)');
      console.log('   4. Generate and copy the token');
      console.log('   5. Set it in PowerShell: $env:GITHUB_TOKEN="your_token_here"');
      console.log('   6. Or in Bash: export GITHUB_TOKEN="your_token_here"');
      console.log('\n💡 The token needs full "repo" scope to modify repository topics.');
    } else {
      console.log(`\n${isDryRun ? '💡 Run with --apply to update GitHub repositories' : '✅ Done!'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Validate environment
if (!isDryRun && !GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required for --apply mode');
  console.error('💡 Set it with: export GITHUB_TOKEN=your_token_here');
  console.error('💡 Or run in dry-run mode: node remove-topics-from-repos.js --topics topic1,topic2 --dry-run');
  process.exit(1);
}

// Run the script
processRepositories().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

// Made with Bob