# Repository Topics Guide for Contributors

## Overview

This guide helps contributors select appropriate topics for their DecisionsDev repositories. Topics improve discoverability and help organize the DecisionsDev ecosystem.

## 🎯 Quick Start for Contributors

### Step 1: Discover Existing Topics

Before adding topics to your repository, see what topics are already in use:

```bash
# List all topics currently used in DecisionsDev
node tools/list-all-topics.js

# See which repositories use each topic
node tools/list-all-topics.js --verbose

# Filter by pattern
node tools/list-all-topics.js --pattern "product-*"
```

### Step 2: Select Relevant Topics

**Choose 3-7 topics** that best describe your repository:

1. **Reuse existing topics** whenever possible for consistency
2. **Select the most relevant** - quality over quantity
3. **Use lowercase with hyphens** (e.g., `decision-center`, not `DecisionCenter`)
4. **Avoid redundancy** - don't add both `odm` and `ibm-odm` (use `odm`)

### Step 3: Add Topics to Your Repository

#### Via GitHub Web UI (Easiest)

1. Go to your repository on GitHub
2. Click the gear icon ⚙️ next to "About" on the right sidebar
3. In the "Topics" field, add your selected topics
4. Click "Save changes"

#### Via GitHub CLI

```bash
# Add topics one at a time
gh repo edit DecisionsDev/your-repo-name --add-topic odm
gh repo edit DecisionsDev/your-repo-name --add-topic docker
gh repo edit DecisionsDev/your-repo-name --add-topic tutorial
```

## 📋 Most Common Topics

Based on current usage across DecisionsDev repositories:

### Products (25+ repos)
- **`odm`** - IBM Operational Decision Manager (most used)
- **`ibm`** - IBM products in general
- **`decision-intelligence`** - IBM Decision Intelligence
- **`bai`** - Business Automation Insights
- **`cp4ba`** - Cloud Pak for Business Automation

### Technologies (10+ repos)
- **`business-rules`** - Business rules engines
- **`artificial-intelligence`** - AI/ML integrations
- **`docker`** - Docker containers
- **`kubernetes`** - Kubernetes orchestration
- **`java`** - Java applications
- **`rpa`** - Robotic Process Automation

### Types (5+ repos)
- **`tutorial`** - Step-by-step guides
- **`sample`** - Code samples
- **`integration`** - Integration examples
- **`tools`** - Utilities and tools

## 🎨 Topic Selection Examples

### Example 1: ODM Docker Tutorial
**Repository**: A tutorial showing how to deploy ODM with Docker

**Good topics**:
```
odm, docker, tutorial, business-rules
```

**Why**: Uses existing popular topics, clearly describes content

**Avoid**:
```
ibm-odm, odmdev-docker, docker-image, dockerfiles, microservices
```
**Why**: Too many topics, includes deprecated prefixes, too specific

### Example 2: Decision Center REST API Sample
**Repository**: Sample code for Decision Center REST API

**Good topics**:
```
odm, decision-center, sample, api, java
```

**Why**: Clear, uses existing topics, describes technology stack

**Avoid**:
```
decisioncenter, dc, rest-api, ibmodm, operational-decision-manager
```
**Why**: Inconsistent naming, abbreviations, redundant

### Example 3: RPA Integration
**Repository**: Integration between ODM and RPA tools

**Good topics**:
```
odm, rpa, integration, automation-anywhere
```

**Why**: Describes both products and purpose

## 🔍 Topic Categories

### Products
Use ONE product topic that best describes your repository:
- `odm` - Operational Decision Manager
- `decision-intelligence` - Decision Intelligence (formerly ADS)
- `bai` - Business Automation Insights
- `cp4ba` - Cloud Pak for Business Automation

### Technologies
Add 2-3 technology topics:
- `docker`, `kubernetes` - Containers
- `java`, `react` - Programming languages
- `kafka` - Messaging
- `analytics` - Analytics/dashboards

### Purpose
Add 1-2 purpose topics:
- `tutorial` - Learning resources
- `sample` - Example code
- `integration` - Integration examples
- `tools` - Utilities

### Domain
Add relevant domain topics:
- `business-rules` - Rules engines
- `artificial-intelligence` - AI/ML
- `rpa` - Robotic Process Automation
- `business-automation` - Business automation

## ⚠️ Topics to Avoid

### Deprecated Prefixes
❌ Don't use: `product-*`, `comp-*`, `type-*`, `odmdev-*`
✅ Use instead: Clean names without prefixes

### Redundant Topics
❌ Don't use both: `ibm-odm` AND `odm`
✅ Use: `odm` (simpler is better)

### Inconsistent Naming
❌ Don't use: `decisioncenter`, `decision-center`, `dc`
✅ Use: `decision-center` (check existing usage first)

### Too Many Topics
❌ Don't add: 10+ topics
✅ Add: 3-7 most relevant topics

## 🛠️ Topic Management Tools

### For Repository Owners

If you need to clean up or standardize topics:

```bash
# Remove old topics
node tools/remove-topics-from-repos.js --topics old-topic --dry-run

# Replace topics (only where they exist)
node tools/remove-topics-from-repos.js --topics ibm-odm --replace odm --dry-run

# Apply changes (after reviewing dry-run)
node tools/remove-topics-from-repos.js --topics ibm-odm --replace odm --apply
```

### For Organization Admins

```bash
# List all topics with usage counts
node tools/list-all-topics.js --sort-count

# Find topics matching a pattern
node tools/list-all-topics.js --pattern "odmdev-*"

# Generate a topics report
node tools/generate-topics-report.js
```

## 📊 Benefits of Good Topics

1. **Discoverability** - Users find your repository more easily
2. **Organization** - Repositories are automatically categorized
3. **Filtering** - Users can filter by product, technology, or type
4. **Consistency** - Standardized topics improve the ecosystem
5. **Analytics** - Better insights into the DecisionsDev portfolio

## 🤝 Getting Help

Not sure which topics to use?

1. **Check similar repositories**: `node tools/list-all-topics.js --verbose`
2. **Ask in discussions**: Open a GitHub discussion
3. **Review the report**: `node tools/generate-topics-report.js`

## 📚 Additional Resources

- [README.md](../README.md) - Main documentation
- [CATEGORIZATION.md](CATEGORIZATION.md) - Categorization system
- [README-TOPICS-SCRIPT.md](README-TOPICS-SCRIPT.md) - Topics script documentation

---

**Remember**: When in doubt, use existing topics! Consistency is more valuable than creating new topics.