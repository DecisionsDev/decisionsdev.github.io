# Repository Categorization System

## Overview

The DecisionsDev website uses an automated categorization system to organize repositories. This system analyzes repository names and descriptions to assign structured categories, making it easier for users to find relevant projects.

## How It Works

### 1. Build Process

The categorization happens during the build process via the `build-repositories.js` script:

```bash
npm run build:repos
```

This script:
1. Fetches all repositories from the DecisionsDev GitHub organization
2. Analyzes each repository using the `topic-analyzer.js` logic
3. Assigns categories based on keywords in the repository name, description, and existing topics
4. Generates `src/data/repositories.json` with both original topics and new categories

### 2. Category Structure

Each repository gets a `categories` object with three arrays:

```json
{
  "name": "odm-ondocker",
  "description": "Deploy ODM with Docker Compose",
  "topics": ["docker", "ibm-odm", "odm"],
  "categories": {
    "products": ["odm"],
    "components": ["container"],
    "types": ["sample"]
  },
  "url": "https://github.com/DecisionsDev/odm-ondocker"
}
```

### 3. Category Types

#### Products
Identifies which IBM product the repository relates to:
- `odm` - Operational Decision Manager
- `decision-intelligence` - Decision Intelligence (ADS)
- `bai` - Business Automation Insights
- `cp4ba` - Cloud Pak for Business Automation

#### Components
Identifies specific components or technologies:
- `decisioncenter` - Decision Center
- `ruleexecutionserver` - Rule Execution Server
- `container` - Docker/Kubernetes/containers
- `ai` - AI/ML/LLM integrations
- `designer` - Designer/modeling tools
- `analytics` - Analytics/dashboards
- `events` - Event processing/Kafka

#### Types
Identifies the repository type:
- `sample` - Code samples and examples
- `tool` - Utilities and tools
- `tutorial` - Step-by-step tutorials
- `documentation` - Documentation and guides
- `deployment` - Deployment configurations
- `integration` - Integration connectors
- `library` - Libraries and SDKs

## Repository Browser

The website's repository browser uses these categories to provide:

### Product Tabs
- **All** - Shows all repositories
- **ODM** - Operational Decision Manager repositories
- **DI** - Decision Intelligence repositories
- **BAI** - Business Automation Insights repositories
- **CP4BA** - Cloud Pak for Business Automation repositories
- **Other** - Repositories without product categorization

### Filters
- **Component Filter** - Filter by component (e.g., container, ai, decisioncenter)
- **Type Filter** - Filter by type (e.g., sample, tool, tutorial)
- **Search** - Free-text search across names and descriptions

## Categorization Rules

The `topic-analyzer.js` module contains the categorization logic:

### Keyword Matching
Each category has associated keywords. For example:
- `odm` product: keywords include "odm", "operational decision manager", "ibm-odm"
- `container` component: keywords include "docker", "kubernetes", "helm", "openshift"
- `sample` type: keywords include "sample", "example", "demo"

### Inference Rules
The system applies intelligent inference rules:

1. **ODM Component Inference**: If a repository mentions Decision Center or Rule Execution Server, it's automatically categorized as ODM
2. **Decision Intelligence Detection**: Repositories with "decision-assistant" are categorized as Decision Intelligence
3. **Decision Engine**: Repositories with "decision-engine" are categorized as ODM
4. **Component Exclusion**: Decision Intelligence repos exclude ODM-specific components
5. **Default Type**: Repositories with products/components but no type get "sample" as default

### Priority System
Each category has a priority score (1-10) that helps determine the most relevant categorization when multiple matches occur.

## Maintaining the System

### Adding New Categories

To add a new category, edit `tools/topic-analyzer.js`:

```javascript
const TOPIC_RULES = {
  products: {
    'newproduct': {
      keywords: ['newproduct', 'new-product'],
      priority: 10
    }
  },
  // ... other categories
};
```

### Updating Keywords

To improve categorization accuracy, add keywords to existing categories in `topic-analyzer.js`:

```javascript
'odm': {
  keywords: ['odm', 'operational decision manager', 'new-keyword'],
  priority: 10
}
```

### Testing Changes

After modifying the categorization logic:

1. Run the build script:
   ```bash
   npm run build:repos
   ```

2. Check the output statistics:
   ```
   Categorization Summary:
     Repositories with products: 45
     Repositories with components: 35
     Repositories with types: 49
     Repositories without products (will appear in "Other"): 13
   ```

3. Review `src/data/repositories.json` to verify categorization

4. Test the website locally:
   ```bash
   npm run dev
   ```

5. Navigate to `/repositories` and verify the tabs and filters work correctly

## Integration with Deployment

The categorization is integrated into the deployment pipeline:

### Automatic Updates
Both `deploy.sh` and `deploy.bat` scripts automatically run `build:repos` before building:

```bash
# In deploy.sh
npm run build:repos  # Fetches and categorizes repositories
npm run build        # Builds the site
```

### Build Pipeline
The `npm run build` command includes `build:repos`:

```json
{
  "scripts": {
    "build:repos": "node tools/build-repositories.js",
    "build": "npm run build:repos && gatsby build"
  }
}
```

This ensures the repository data is always fresh when deploying.

## Backward Compatibility

The system maintains backward compatibility:

- **Original Topics Preserved**: GitHub topics are kept in the `topics` field
- **Additive Approach**: The `categories` field is added without removing existing data
- **Graceful Degradation**: The UI handles repositories without categories

## Troubleshooting

### Repositories Not Categorized

If repositories aren't being categorized correctly:

1. Check if keywords match the repository name/description
2. Review the inference rules in `topic-analyzer.js`
3. Add more specific keywords for better matching
4. Run `npm run build:repos` to regenerate

### "Other" Tab Shows Too Many Repos

If too many repositories appear in "Other":

1. Review repositories without product categorization
2. Add appropriate keywords to `topic-analyzer.js`
3. Consider adding inference rules for common patterns
4. Regenerate with `npm run build:repos`

### Categories Not Appearing in UI

If categories don't show in the browser:

1. Verify `src/data/repositories.json` has the `categories` field
2. Check browser console for JavaScript errors
3. Clear Gatsby cache: `npm run clean`
4. Rebuild: `npm run build`

## Future Enhancements

Potential improvements to the categorization system:

- Machine learning-based categorization
- User feedback mechanism for improving accuracy
- Category suggestions for new repositories
- Automated topic management via GitHub API
- Multi-language support for descriptions

---

For more information, see:
- [TOPICS_GUIDE.md](TOPICS_GUIDE.md) - Guide for repository topics
- [README-TOPICS-SCRIPT.md](README-TOPICS-SCRIPT.md) - Topics script documentation
- [topic-analyzer.js](../tools/topic-analyzer.js) - Categorization logic

© 2025 IBM Corporation