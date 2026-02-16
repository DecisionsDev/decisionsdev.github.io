# Setup Guide for DecisionsDev GitHub Pages

This guide will walk you through setting up the DecisionsDev GitHub Pages website using Gatsby and the IBM Carbon Design theme.

## Prerequisites

Before you begin, ensure you have:

- [ ] Node.js 18.x or higher installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] Access to the DecisionsDev GitHub organization
- [ ] Permission to create repositories in the organization

## Step 1: Create the Repository

1. Go to [GitHub DecisionsDev Organization](https://github.com/DecisionsDev)
2. Click "New repository"
3. **Important**: Name it exactly `DecisionsDev.github.io`
4. Set visibility to **Public**
5. Do NOT initialize with README (we have files ready)
6. Click "Create repository"

## Step 2: Upload the Template Files

### Option A: Using Git Command Line

```bash
# Navigate to the template directory
cd C:\Users\7D4153897\Downloads\DecisionsDev.github.io

# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Gatsby Carbon theme setup"

# Add remote
git remote add origin https://github.com/DecisionsDev/DecisionsDev.github.io.git

# Push to main branch
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Desktop

1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose `C:\Users\7D4153897\Downloads\DecisionsDev.github.io`
4. Commit all files with message "Initial commit: Gatsby Carbon theme setup"
5. Publish repository to GitHub
6. Select DecisionsDev organization
7. Name: `DecisionsDev.github.io`
8. Push to GitHub

## Step 3: Install Dependencies

```bash
# Navigate to the repository
cd DecisionsDev.github.io

# Install dependencies
npm install
```

This will install:
- Gatsby
- gatsby-theme-carbon
- React and React DOM
- All required dependencies

## Step 4: Test Locally

```bash
# Start development server
npm run dev
```

The site will be available at `http://localhost:8000`

**Verify:**
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Deployment Tools page displays
- [ ] All links work
- [ ] Styling looks correct

## Step 5: Build for Production

```bash
# Build the site
npm run build
```

This creates optimized production files in the `public/` directory.

**Verify:**
- [ ] Build completes without errors
- [ ] No warnings about missing files
- [ ] Public directory contains built files

## Step 6: Deploy to GitHub Pages

### Option A: Using npm script (Recommended)

```bash
# Deploy to gh-pages branch
npm run deploy
```

This will:
1. Build the site
2. Create/update `gh-pages` branch
3. Push built files to GitHub

### Option B: Manual Deployment

```bash
# Build the site
npm run build

# Install gh-pages if not already installed
npm install -g gh-pages

# Deploy
gh-pages -d public
```

## Step 7: Configure GitHub Pages

1. Go to repository Settings
2. Click "Pages" in the left sidebar
3. Under "Source":
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click "Save"

**Wait 2-5 minutes for deployment**

## Step 8: Verify Deployment

1. Visit `https://decisionsdevelopment.github.io/`
2. Verify all pages load correctly
3. Test navigation
4. Check that all links work
5. Test on mobile devices

## Step 9: Set Up Continuous Deployment (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

This will automatically deploy when you push to main branch.

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port 8000 Already in Use

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### Deployment Not Showing

1. Check GitHub Actions tab for errors
2. Verify gh-pages branch exists
3. Check GitHub Pages settings
4. Wait 5-10 minutes for DNS propagation
5. Clear browser cache

### Missing Dependencies

```bash
# Reinstall all dependencies
npm install
```

## Next Steps

After successful deployment:

1. **Add Content**: Update pages with actual project information
2. **Add Images**: Place images in `src/images/`
3. **Customize Theme**: Modify `gatsby-config.js`
4. **Add More Pages**: Create new `.mdx` files in `src/pages/`
5. **Update Navigation**: Edit theme configuration

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update Gatsby
npm install gatsby@latest gatsby-theme-carbon@latest
```

### Adding New Projects

1. Edit relevant category page (e.g., `src/pages/deployment-tools.mdx`)
2. Add project information
3. Commit and push
4. Site will auto-deploy (if CI/CD is set up)

## Support

If you encounter issues:

1. Check the [Gatsby Carbon Theme docs](https://gatsby-theme-carbon.now.sh/)
2. Review [Gatsby documentation](https://www.gatsbyjs.com/docs/)
3. Open an issue in the repository
4. Contact DecisionsDev maintainers

## Checklist

- [ ] Repository created as `DecisionsDev.github.io`
- [ ] Files uploaded to GitHub
- [ ] Dependencies installed
- [ ] Local development server works
- [ ] Production build successful
- [ ] Deployed to GitHub Pages
- [ ] GitHub Pages configured
- [ ] Site accessible at URL
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] CI/CD set up (optional)

---

© 2025 IBM Corporation