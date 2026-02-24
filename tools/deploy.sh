#!/bin/bash

# Deploy DecisionsDev GitHub Pages
# This script builds the Gatsby site and deploys it to GitHub Pages

set -e  # Exit on error

echo "🚀 DecisionsDev GitHub Pages Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
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

# Build the site
echo "🔨 Building Gatsby site..."
npm run build
echo "✅ Build complete"
echo ""

# Deploy to GitHub Pages
echo "📤 Deploying to GitHub Pages..."
npm run deploy
echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site will be available at: https://decisionsdev.github.io"
echo "⏱️  It may take a few minutes for changes to appear"

# Made with Bob
