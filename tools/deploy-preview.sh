#!/bin/bash

# Deploy DecisionsDev Preview to GitHub Enterprise
# This script builds the Gatsby site and deploys it to a private preview repository

set -e  # Exit on error

echo "🔍 DecisionsDev Preview Deployment"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if preview remote exists
if ! git remote | grep -q "^preview$"; then
    echo "❌ Error: 'preview' remote not configured."
    echo ""
    echo "Please add the preview remote first:"
    echo "  git remote add preview https://your-ghe-instance.com/DecisionsDev/decisionsdev-preview.git"
    echo ""
    echo "Replace 'your-ghe-instance.com' with your actual GHE hostname."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean
echo "✅ Clean complete"
echo ""

# Fetch and categorize repositories
echo "📚 Fetching and categorizing repositories..."
npm run build:repos
echo "✅ Repositories updated"
echo ""

# Extract videos from repositories
echo "🎥 Extracting videos from repositories..."
npm run build:videos
echo "✅ Videos extracted"
echo ""

# Build the site with path prefix
echo "🔨 Building Gatsby site with path prefix..."
export PATH_PREFIX=/odm-l3-services/decisionsdev-preview
npx gatsby build --prefix-paths
echo "✅ Build complete"
echo ""

# Deploy to preview repository
echo "📤 Deploying to preview repository..."
PREVIEW_URL=$(git remote get-url preview)
npx gh-pages -d public -r "$PREVIEW_URL"
echo ""
echo "✅ Preview deployment complete!"
echo ""
echo "🔍 Your preview site will be available at:"
echo "   https://pages.github.ibm.com/odm-l3-services/decisionsdev-preview/"
echo ""
echo "⏱️  It may take a few minutes for changes to appear"
echo "👥 Share this URL with reviewers who have been granted access"

# Made with Bob