#!/usr/bin/env node

/**
 * Generate a report of suggested topics for all DecisionsDev repositories
 * Creates a markdown table showing what topics would be added to each repo
 */

const https = require('https');
const fs = require('fs');
const { analyzeRepository } = require('./topic-analyzer');

const ORG_NAME = 'DecisionsDev';

function fetchRepositories() {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'DecisionsDev-Topic-Manager',
      'Accept': 'application/vnd.github.v3+json'
    };

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

async function generateReport() {
  console.log('🔍 Fetching repositories from DecisionsDev organization...\n');

  try {
    const repos = await fetchRepositories();
    console.log(`📦 Found ${repos.length} repositories\n`);
    console.log('📊 Analyzing and generating report...\n');

    let report = '# DecisionsDev Repository Topics Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Total Repositories: ${repos.length}\n\n`;
    
    // Summary statistics
    let reposWithSuggestions = 0;
    let totalSuggestions = 0;
    const productCounts = {};
    const componentCounts = {};
    const typeCounts = {};

    // Analyze all repos first for statistics
    const analyses = repos.map(repo => {
      const suggestions = analyzeRepository(repo);
      const allSuggestions = [
        ...suggestions.products,
        ...suggestions.components,
        ...suggestions.types
      ];
      
      if (allSuggestions.length > 0) {
        reposWithSuggestions++;
        totalSuggestions += allSuggestions.length;
      }

      suggestions.products.forEach(p => productCounts[p] = (productCounts[p] || 0) + 1);
      suggestions.components.forEach(c => componentCounts[c] = (componentCounts[c] || 0) + 1);
      suggestions.types.forEach(t => typeCounts[t] = (typeCounts[t] || 0) + 1);

      return { repo, suggestions, allSuggestions };
    });

    // Summary section
    report += '## Summary\n\n';
    report += `- Repositories with suggested topics: ${reposWithSuggestions} / ${repos.length}\n`;
    report += `- Total topic suggestions: ${totalSuggestions}\n`;
    report += `- Average suggestions per repo: ${(totalSuggestions / reposWithSuggestions).toFixed(1)}\n\n`;

    // Top topics
    report += '### Most Common Suggested Topics\n\n';
    report += '**Products:**\n';
    Object.entries(productCounts).sort((a, b) => b[1] - a[1]).forEach(([topic, count]) => {
      report += `- ${topic}: ${count} repositories\n`;
    });
    report += '\n**Components:**\n';
    Object.entries(componentCounts).sort((a, b) => b[1] - a[1]).forEach(([topic, count]) => {
      report += `- ${topic}: ${count} repositories\n`;
    });
    report += '\n**Types:**\n';
    Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).forEach(([topic, count]) => {
      report += `- ${topic}: ${count} repositories\n`;
    });
    report += '\n';

    // Detailed table
    report += '## Detailed Repository Analysis\n\n';
    report += '| Repository | Current Topics | Suggested Topics | Status |\n';
    report += '|------------|----------------|------------------|--------|\n';

    analyses.sort((a, b) => a.repo.name.localeCompare(b.repo.name)).forEach(({ repo, suggestions, allSuggestions }) => {
      const currentTopics = repo.topics || [];
      const structuredPrefixes = ['product-', 'comp-', 'type-'];
      const hasStructured = currentTopics.some(t => structuredPrefixes.some(p => t.startsWith(p)));
      
      const currentDisplay = currentTopics.length > 0 
        ? currentTopics.slice(0, 3).join(', ') + (currentTopics.length > 3 ? '...' : '')
        : '(none)';
      
      const suggestedDisplay = allSuggestions.length > 0
        ? allSuggestions.join(', ')
        : '(none)';
      
      const status = allSuggestions.length === 0 
        ? '✓ No changes'
        : hasStructured 
          ? '⚠️ Has some'
          : '➕ New topics';

      report += `| [${repo.name}](${repo.html_url}) | ${currentDisplay} | ${suggestedDisplay} | ${status} |\n`;
    });

    report += '\n## Legend\n\n';
    report += '- ✓ No changes: No structured topics suggested\n';
    report += '- ⚠️ Has some: Repository already has some structured topics\n';
    report += '- ➕ New topics: New structured topics will be added\n';

    // Write to file
    fs.writeFileSync('topics-report.md', report);
    console.log('✅ Report generated: topics-report.md\n');
    
    // Also print summary to console
    console.log('📊 Summary:');
    console.log(`   Repositories analyzed: ${repos.length}`);
    console.log(`   Repositories with suggestions: ${reposWithSuggestions}`);
    console.log(`   Total topic suggestions: ${totalSuggestions}`);
    console.log('\n💡 Open topics-report.md to see the full report');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateReport();

// Made with Bob
