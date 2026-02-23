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

# Build the site
echo "🔨 Building Gatsby site..."
npm run build
echo "✅ Build complete"
echo ""

# Deploy to preview repository
echo "📤 Deploying to preview repository..."
npx gh-pages -d public -r preview
echo ""
echo "✅ Preview deployment complete!"
echo ""
echo "🔍 Your preview site will be available at:"
echo "   https://your-ghe-instance.com/pages/DecisionsDev/decisionsdev-preview/"
echo ""
echo "⏱️  It may take a few minutes for changes to appear"
echo "👥 Share this URL with reviewers who have been granted access"

# Made with Bob