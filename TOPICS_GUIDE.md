# Repository Topics Guide

## Adding Structured Topics to DecisionsDev Repositories

This guide explains how to add structured topics to repositories in the DecisionsDev organization.

## Topic Structure

We use three types of structured topics:

1. **product-xxx**: Which IBM product (e.g., `product-odm`, `product-ads`, `product-bai`)
2. **comp-xxx**: Which component (e.g., `comp-decisioncenter`, `comp-ruleexecutionserver`, `comp-dsi`)
3. **type-xxx**: Repository type (e.g., `type-sample`, `type-tool`, `type-tutorial`, `type-documentation`)

## Example: odm-dc-rest-api-sample

This repository already has the correct structure:

```
Topics: product-odm, comp-decisioncenter, type-sample, decisioncenter, odm, sample
```

### How to Add Topics via GitHub CLI

```bash
# Navigate to your repository
cd odm-dc-rest-api-sample

# Add product topic
gh repo edit DecisionsDev/odm-dc-rest-api-sample --add-topic product-odm

# Add component topic
gh repo edit DecisionsDev/odm-dc-rest-api-sample --add-topic comp-decisioncenter

# Add type topic
gh repo edit DecisionsDev/odm-dc-rest-api-sample --add-topic type-sample
```

### How to Add Topics via GitHub Web UI

1. Go to your repository on GitHub
2. Click the gear icon ⚙️ next to "About" on the right sidebar
3. In the "Topics" field, add: `product-odm`, `comp-decisioncenter`, `type-sample`
4. Click "Save changes"

## Recommended Topics for Common Scenarios

### ODM Docker/Kubernetes Projects
```
product-odm
comp-docker
type-deployment
```

### ODM Decision Center Tools
```
product-odm
comp-decisioncenter
type-tool
```

### ODM Samples
```
product-odm
comp-ruleexecutionserver
type-sample
```

### ADS Projects
```
product-ads
comp-runtime
type-sample
```

### BAI Projects
```
product-bai
comp-analytics
type-integration
```

## Product Values

- `product-odm` - IBM Operational Decision Manager
- `product-ads` - IBM Automation Decision Services
- `product-bai` - IBM Business Automation Insights
- `product-cp4ba` - IBM Cloud Pak for Business Automation

## Component Values

### ODM Components
- `comp-decisioncenter` - Decision Center
- `comp-ruleexecutionserver` - Rule Execution Server
- `comp-dsi` - Decision Server Insights
- `comp-docker` - Docker/Container related
- `comp-kubernetes` - Kubernetes related

### ADS Components
- `comp-runtime` - ADS Runtime
- `comp-designer` - ADS Designer

### BAI Components
- `comp-analytics` - Analytics/Dashboards
- `comp-events` - Event processing

## Type Values

- `type-sample` - Code samples and examples
- `type-tool` - Utilities and tools
- `type-tutorial` - Step-by-step tutorials
- `type-documentation` - Documentation repositories
- `type-deployment` - Deployment configurations
- `type-integration` - Integration examples
- `type-library` - Reusable libraries

## Benefits

1. **Better Discovery**: Users can find repositories by product, component, or type
2. **Automatic Organization**: The website automatically groups repositories
3. **Filtering**: Users can filter repositories by multiple criteria
4. **Consistency**: Standardized naming helps maintain organization

## Migration Plan

We recommend adding these structured topics to all repositories gradually:

1. Start with the most popular repositories
2. Add topics during regular maintenance
3. Update documentation to reference the new structure