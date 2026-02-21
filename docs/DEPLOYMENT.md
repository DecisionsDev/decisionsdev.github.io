# Deployment Guide

This guide explains how to deploy the DecisionsDev GitHub Pages site.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Git configured with GitHub access

## Quick Deploy

### Linux/Mac

```bash
chmod +x deploy.sh
./deploy.sh
```

### Windows

```cmd
deploy.bat
```

### Manual Deploy

```bash
npm install          # Install dependencies
npm run clean        # Clean previous builds
npm run build        # Build the site
npm run deploy       # Deploy to GitHub Pages
```

## What the Deploy Script Does

1. **Checks environment** - Verifies you're in the correct directory
2. **Installs dependencies** - Runs `npm install` if needed
3. **Cleans previous builds** - Removes old build artifacts
4. **Builds the site** - Compiles Gatsby site to `public/` directory
5. **Deploys to GitHub Pages** - Pushes `public/` to `gh-pages` branch

## Deployment Details

- **Target**: `gh-pages` branch of the repository
- **URL**: https://decisionsdev.github.io
- **Build time**: ~2-5 minutes
- **Propagation time**: 1-5 minutes after deployment

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Fails

Check that you have:
- Write access to the repository
- Git configured correctly
- No uncommitted changes blocking the deployment

### Site Not Updating

- Wait 5-10 minutes for GitHub Pages to propagate
- Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check GitHub repository settings → Pages

## Development Workflow

### Local Development

```bash
npm run dev
# or
npm start
```

Visit http://localhost:8000 to see your changes.

### Before Deploying

1. Test locally with `npm run dev`
2. Verify all changes work as expected
3. Commit your changes to git
4. Run the deployment script

### After Deploying

1. Wait a few minutes for propagation
2. Visit https://decisionsdev.github.io
3. Verify changes are live
4. Clear cache if needed

## GitHub Pages Configuration

The site is configured to deploy from the `gh-pages` branch. This is handled automatically by the `gh-pages` npm package.

### Repository Settings

Go to: Repository → Settings → Pages

- **Source**: Deploy from a branch
- **Branch**: `gh-pages`
- **Folder**: `/ (root)`

## Continuous Deployment (Optional)

To set up automatic deployment on push:

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

2. Push to main branch
3. GitHub Actions will automatically deploy

## Updating Repository Data

Before deploying, you may want to update the repository list:

```bash
node fetch-repos.js > src/data/repositories.json
```

This fetches the latest repositories from the DecisionsDev organization.

## Support

For issues:
1. Check the [Gatsby documentation](https://www.gatsbyjs.com/docs/)
2. Check the [gh-pages documentation](https://github.com/tschaub/gh-pages)
3. Open an issue in the repository

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build production site |
| `npm run serve` | Serve production build locally |
| `npm run clean` | Clean build cache |
| `npm run deploy` | Deploy to GitHub Pages |
| `./deploy.sh` | Full deployment (Linux/Mac) |
| `deploy.bat` | Full deployment (Windows) |