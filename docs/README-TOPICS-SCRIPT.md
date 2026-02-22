# GitHub Topics Management Script

This script automatically adds structured topics to repositories in the DecisionsDev GitHub organization based on repository names and descriptions.

## Overview

The script analyzes repository metadata (name, description, and existing topics) and suggests appropriate structured topics following these categories:
- **Products**: Which IBM product (e.g., `odm`, `decision-intelligence`)
- **Components**: Which component (e.g., `decisioncenter`, `container`, `ai`)
- **Types**: Repository type (e.g., `sample`, `tool`, `integration`)

## Prerequisites

1. **Node.js** installed on your system
2. **GitHub Personal Access Token** with `repo` scope (only needed for applying changes)

### Creating a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "DecisionsDev Topics Manager")
4. Select the `repo` scope (full control of private repositories)
5. Click "Generate token"
6. Copy the token immediately (you won't see it again!)

## Installation

No installation required! The script uses only Node.js built-in modules.

## Usage

### Preview Mode (Dry Run)

Preview what topics would be added without making any changes:

```bash
# Preview all repositories
node add-topics-to-repos.js --dry-run

# Preview a specific repository
node add-topics-to-repos.js --dry-run --repo=odm-ondocker
```

### Apply Mode

Apply the suggested topics to GitHub repositories:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Apply to all repositories
node add-topics-to-repos.js --apply

# Apply to a specific repository
node add-topics-to-repos.js --apply --repo=odm-ondocker
```

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN="your_token_here"
node add-topics-to-repos.js --apply
```

**Windows Command Prompt:**
```cmd
set GITHUB_TOKEN=your_token_here
node add-topics-to-repos.js --apply
```

## Topic Rules

### Products

| Topic | Keywords | Description |
|-------|----------|-------------|
| `odm` | odm, operational decision manager, decision manager, ibm-odm, ibmodm | IBM Operational Decision Manager |
| `decision-intelligence` | ads, automation decision services, ibm-ads, di, decision intelligence | IBM Decision Intelligence (formerly ADS) |
| `bai` | bai, business automation insights, insights | IBM Business Automation Insights |
| `cp4ba` | cp4ba, cloud pak, business automation | IBM Cloud Pak for Business Automation |

### Components

| Topic | Keywords | Description |
|-------|----------|-------------|
| `decisioncenter` | decision center, decisioncenter, dc-, -dc-, decision-center | Decision Center |
| `ruleexecutionserver` | rule execution server, ruleapp, ruleset, execution, runtime, micro-decision, res- | Rule Execution Server / Runtime |
| `dsi` | dsi, decision server insights, insights, situation | Decision Server Insights |
| `container` | docker, dockerfile, container, ondocker, kubernetes, k8s, helm, openshift | Container/Kubernetes deployments |
| `ai` | ai, mcp, llm, artificial intelligence, machine learning, ml | AI/ML integrations |
| `designer` | designer, modeling, authoring | Design/authoring tools |
| `analytics` | analytics, dashboard, kibana, monitoring | Analytics and monitoring |
| `events` | event, kafka, messaging, stream | Event processing |

### Types

| Topic | Keywords | Description |
|-------|----------|-------------|
| `sample` | sample, example, demo, showcase | Code samples and examples |
| `tool` | tool, utility, cli, extractor, loader, report | Utilities and tools |
| `tutorial` | tutorial, getting-started, gettingstarted, step-by-step | Step-by-step tutorials |
| `documentation` | documentation, docs, guide | Documentation repositories |
| `deployment` | deployment, install, setup, configuration | Deployment configurations |
| `integration` | integration, connector, adapter, bridge, mcp | Integration examples |
| `library` | library, libs, sdk, api | Reusable libraries |

## How It Works

1. **Fetches** all repositories from the DecisionsDev organization
2. **Analyzes** each repository's name, description, and existing topics
3. **Matches** keywords against the topic rules
4. **Calculates** confidence scores based on keyword matches
5. **Suggests** structured topics (product, component, type)
6. **Preserves** existing non-structured topics
7. **Updates** repository topics via GitHub API (in apply mode)

## Examples

### Example 1: Docker Repository

```bash
$ node add-topics-to-repos.js --dry-run --repo=odm-ondocker

[1/1] 📁 odm-ondocker
Description: This repository allows to deploy an IBM Operational Decision Manager topology with Docker Compose

📊 Suggested structured topics:
   • odm (confidence: 6.0, matches: odm, operational decision manager, decision manager)
   • container (confidence: 1.8, matches: docker, ondocker)

📋 Current topics: java, odm, docker, microservices, docker-compose, ...
🎯 Proposed topics: odm, container, java, docker, microservices, ...
```

### Example 2: AI Integration

```bash
$ node add-topics-to-repos.js --dry-run --repo=ibm-decision-intelligence-mcp-server

[1/1] 📁 ibm-decision-intelligence-mcp-server
Description: MCP Server for IBM Decision Intelligence to extend AI experience with decisioning capabilities

📊 Suggested structured topics:
   • decision-intelligence (confidence: 3.3, matches: decision intelligence, decision-intelligence)
   • ai (confidence: 2.3, matches: ai, mcp)
   • integration (confidence: 1.6, matches: mcp)

📋 Current topics: decision, llm, mcp, rules, ai, ibm, ibm-watson
🎯 Proposed topics: decision-intelligence, ai, integration, decision, llm, mcp, rules, ibm, ibm-watson
```

### Example 3: Sample Repository

```bash
$ node add-topics-to-repos.js --dry-run --repo=odm-dc-rest-api-sample

[1/1] 📁 odm-dc-rest-api-sample
Description: Web application to demonstrate usage of DC rest API for deployment

📊 Suggested structured topics:
   • odm (confidence: 2.0, matches: odm)
   • decisioncenter (confidence: 3.2, matches: dc-, -dc-)
   • sample (confidence: 4.5, matches: sample, demo)

📋 Current topics: decisioncenter, odm, sample
🎯 Proposed topics: odm, decisioncenter, sample
```

## Features

- ✅ **Safe by default**: Runs in dry-run mode unless `--apply` is specified
- ✅ **Preserves existing topics**: Keeps non-structured topics intact
- ✅ **Confidence scoring**: Shows match quality for each suggestion
- ✅ **Rate limiting**: Waits 1 second between API calls to respect GitHub limits
- ✅ **Error handling**: Gracefully handles API errors and continues processing
- ✅ **Detailed output**: Shows exactly what will change before applying

## Troubleshooting

### "GITHUB_TOKEN environment variable is required"

You need to set your GitHub token before running in apply mode:
```bash
export GITHUB_TOKEN=your_token_here
```

### "Failed to get topics: 404"

The repository might not exist or you don't have access. Check the repository name.

### "Failed to update topics: 403"

Your GitHub token might not have the required `repo` scope. Create a new token with proper permissions.

### Rate Limiting

If you hit GitHub's rate limit, the script will show an error. Wait a few minutes and try again. The script includes a 1-second delay between updates to minimize this risk.

## Best Practices

1. **Always test in dry-run mode first** to preview changes
2. **Start with a single repository** using `--repo=name` to verify behavior
3. **Review the confidence scores** - low scores might indicate false positives
4. **Keep your token secure** - never commit it to version control
5. **Run periodically** to keep topics up-to-date as repositories evolve

## Customization

To modify the topic rules, edit the `TOPIC_RULES` object in `topic-analyzer.js`:

```javascript
const TOPIC_RULES = {
  products: {
    'new-product': {
      keywords: ['keyword1', 'keyword2'],
      priority: 10
    }
  },
  // ... more rules
};
```

## Support

For issues or questions:
1. Check this documentation
2. Review the script output for error messages
3. Open an issue in the repository

## License

Apache-2.0 - Same as the DecisionsDev organization