# DecisionsDev GitHub Pages - Gatsby Carbon Theme

This repository hosts the GitHub Pages website for the DecisionsDev organization, built with Gatsby and the IBM Carbon Design System theme.

## 🌐 Live Site

Once deployed, the site will be available at: `https://decisionsdevelopment.github.io/`

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/DecisionsDev/DecisionsDev.github.io.git
cd DecisionsDev.github.io

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:8000`

## 📁 Project Structure

```
DecisionsDev.github.io/
├── src/
│   ├── pages/
│   │   ├── index.mdx              # Homepage
│   │   ├── deployment-tools.mdx   # Deployment tools page
│   │   ├── rest-api.mdx           # REST API samples page
│   │   └── docker.mdx             # Docker resources page
│   ├── images/                    # Image assets
│   ├── components/                # React components
│   ├── data/                      # Data files (repositories.json, nav-items.yaml)
│   └── gatsby-theme-carbon/       # Theme customizations
├── docs/                          # Documentation files
│   ├── SETUP.md                   # Setup guide
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── README-TOPICS-SCRIPT.md    # Topics script documentation
│   ├── TOPICS_GUIDE.md            # Topics guide
│   └── topics-report.md           # Topics report
├── tools/                         # Utility scripts
│   ├── build-repositories.js      # Build repositories.json with categorization
│   ├── fetch-repos.js             # Fetch repositories from GitHub
│   ├── generate-topics-report.js  # Generate topics report
│   ├── add-topics-to-repos.js     # Add topics to repositories
│   ├── topic-analyzer.js          # Analyze repository topics
│   ├── deploy.sh                  # Deployment script (Linux/Mac)
│   └── deploy.bat                 # Deployment script (Windows)
├── gatsby-config.js               # Gatsby configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Fetch and categorize repositories from GitHub
npm run build:repos

# Build for production (includes build:repos)
npm run build

# Serve production build locally
npm run serve

# Clean cache and build artifacts
npm run clean

# Deploy to GitHub Pages (production)
npm run deploy

# Deploy to preview repository (for review)
npm run deploy:preview
```

### Adding New Pages

1. Create a new `.mdx` file in `src/pages/`
2. Add frontmatter with title and description
3. Write content using MDX (Markdown + React components)
4. The page will be automatically available at `/filename`

Example:

```mdx
---
title: My New Page
description: Description of the page
---

<PageDescription>

Brief description of the page content.

</PageDescription>

## Content goes here

Your content using Markdown and Carbon components.
```

### Using Carbon Components

The Gatsby Carbon theme provides many pre-built components:

```mdx
<Row>
<Column colLg={8}>

Content in a column

</Column>
</Row>

<Button href="/link">Button Text</Button>

<ResourceCard
  subTitle="Card Title"
  href="/link"
>

![Icon](./icon.svg)

</ResourceCard>
```

## 📝 Content Organization

### Project Categories

Projects are organized into these categories:

- **Deployment Tools** (`/deployment-tools`) - Deployment utilities and automation
- **REST API & Samples** (`/rest-api`) - API examples and integrations
- **Docker & Containers** (`/docker`) - Container images and orchestration
- **Documentation** - Guides and learning resources
- **Development Tools** - Development utilities
- **CI/CD & Automation** - Continuous integration resources

### Adding Projects

To add a new project to a category page:

1. Open the relevant `.mdx` file (e.g., `src/pages/deployment-tools.mdx`)
2. Add a new section with project details
3. Include links to the GitHub repository
4. Add relevant tags and descriptions

## 🎨 Customization

### Theme Configuration

Edit `gatsby-config.js` to customize:

```javascript
{
  resolve: 'gatsby-theme-carbon',
  options: {
    theme: {
      homepage: 'dark',  // 'dark' or 'white'
      interior: 'g10',   // 'g10', 'g90', 'g100', 'white'
    },
  },
}
```

### Styling

The Carbon theme uses IBM's design system. Custom styles can be added in:
- `src/gatsby-theme-carbon/styles/` - Global style overrides
- Component-level styles using CSS modules

## 🚢 Deployment

### GitHub Pages Deployment

1. **Automatic Deployment** (Recommended):

```bash
# Build and deploy to gh-pages branch
npm run deploy
```

2. **Manual Deployment**:

```bash
# Build the site
npm run build

# The built site is in the 'public' directory
# Push the public directory to gh-pages branch
```

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

### Enabling GitHub Pages

1. Go to repository Settings
2. Navigate to "Pages"
3. Select source: `gh-pages` branch
4. Save

The site will be live at `https://decisionsdevelopment.github.io/`

## 🛠️ Tools

The `tools/` directory contains utility scripts for managing the repository:

### Repository Management
- **build-repositories.js** - Fetch repos from GitHub and apply categorization (creates repositories.json)
- **fetch-repos.js** - Fetch repository data from GitHub API
- **topic-analyzer.js** - Analyze repository topics and suggest categories

### Topic Management
- **list-all-topics.js** - List all topics used across DecisionsDev repositories
- **remove-topics-from-repos.js** - Remove or replace topics in repositories
- **add-topics-to-repos.js** - Automatically add structured topics to repositories
- **generate-topics-report.js** - Generate a report of repository topics

### Deployment
- **deploy.sh** / **deploy.bat** - Production deployment scripts for Linux/Mac and Windows
- **deploy-preview.sh** / **deploy-preview.bat** - Preview deployment scripts for private review

### Using the Tools

```bash
# Build repositories.json with categorization (recommended)
npm run build:repos

# List all topics used in the organization
node tools/list-all-topics.js
node tools/list-all-topics.js --verbose  # Show which repos use each topic
node tools/list-all-topics.js --pattern "product-*"  # Filter by pattern

# Remove topics from repositories
node tools/remove-topics-from-repos.js --topics old-topic --dry-run
node tools/remove-topics-from-repos.js --topics old-topic --apply

# Replace topics (only where they exist)
node tools/remove-topics-from-repos.js --topics old-topic --replace new-topic --dry-run
node tools/remove-topics-from-repos.js --pattern "odmdev-*" --replace odm --apply

# Generate topics report
node tools/generate-topics-report.js

# Deploy the site
./tools/deploy.sh  # Linux/Mac
tools\deploy.bat   # Windows
```

### Repository Categorization

The `build-repositories.js` script automatically categorizes repositories based on their names and descriptions:

- **Products**: `odm`, `decision-intelligence`, `bai`, `cp4ba`
- **Components**: `decisioncenter`, `ruleexecutionserver`, `container`, `ai`, etc.
- **Types**: `sample`, `tool`, `tutorial`, `documentation`, `integration`, etc.

The script:
1. Fetches all repositories from the DecisionsDev GitHub organization
2. Analyzes each repository using `topic-analyzer.js`
3. Adds a `categories` field with clean names (without prefixes)
4. Preserves original GitHub `topics` for backward compatibility
5. Writes the result to `src/data/repositories.json`

Example output structure:
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

## 📖 Documentation

The `docs/` directory contains detailed documentation:

- **[SETUP.md](docs/SETUP.md)** - Complete setup guide
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[PREVIEW-DEPLOYMENT.md](docs/PREVIEW-DEPLOYMENT.md)** - Preview deployment for private review
- **[CATEGORIZATION.md](docs/CATEGORIZATION.md)** - Repository categorization system
- **[TOPICS_GUIDE.md](docs/TOPICS_GUIDE.md)** - Guide for repository topics
- **[README-TOPICS-SCRIPT.md](docs/README-TOPICS-SCRIPT.md)** - Topics script documentation

## 📚 Resources

### Gatsby Carbon Theme

- [Documentation](https://gatsby-theme-carbon.now.sh/)
- [GitHub Repository](https://github.com/carbon-design-system/gatsby-theme-carbon)
- [Component Library](https://gatsby-theme-carbon.now.sh/components/markdown)

### IBM Carbon Design System

- [Design System](https://carbondesignsystem.com/)
- [Components](https://react.carbondesignsystem.com/)
- [Icons](https://carbondesignsystem.com/guidelines/icons/library/)

### Gatsby

- [Documentation](https://www.gatsbyjs.com/docs/)
- [Tutorials](https://www.gatsbyjs.com/tutorial/)

## 🤝 Contributing

### Adding Content

1. Fork the repository
2. Create a feature branch
3. Add or update content
4. Test locally with `npm run dev`
5. Submit a pull request

### Content Guidelines

- Use clear, concise language
- Include code examples where appropriate
- Add links to relevant repositories
- Use proper Markdown formatting
- Test all links

### Adding Topics to Your Repository

When contributing a new repository to DecisionsDev, please add relevant topics:

1. **Use existing topics** - Run `node tools/list-all-topics.js` to see all topics currently in use
2. **Select the most relevant** - Choose 3-7 topics that best describe your repository
3. **Follow the pattern** - Use lowercase, hyphenated names (e.g., `decision-center`, not `DecisionCenter`)
4. **Common topics include**:
   - **Products**: `odm`, `decision-intelligence`, `bai`, `cp4ba`
   - **Technologies**: `docker`, `kubernetes`, `java`, `react`, `kafka`
   - **Types**: `tutorial`, `sample`, `integration`, `rpa`
   - **Components**: `decision-center`, `dsi`, `analytics`

**Example**: For an ODM Docker tutorial, use: `odm`, `docker`, `tutorial`, `business-rules`

See [TOPICS_GUIDE.md](docs/TOPICS_GUIDE.md) for detailed guidance.

### Code Style

- Follow existing file structure
- Use meaningful component names
- Add comments for complex logic
- Keep pages focused and organized

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Port Already in Use

```bash
# Kill process on port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This website is licensed under the Apache License 2.0.

## 📞 Support

For issues or questions:
- [GitHub Issues](https://github.com/DecisionsDev/DecisionsDev.github.io/issues)
- [IBM Community](https://community.ibm.com/)

---

© 2025 IBM Corporation