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
│   └── gatsby-theme-carbon/       # Theme customizations
├── gatsby-config.js               # Gatsby configuration
├── package.json                   # Dependencies
└── README.md                      # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Serve production build locally
npm run serve

# Clean cache and build artifacts
npm run clean

# Deploy to GitHub Pages
npm run deploy
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