@echo off
REM Deploy DecisionsDev GitHub Pages
REM This script builds the Gatsby site and deploys it to GitHub Pages

echo.
echo 🚀 DecisionsDev GitHub Pages Deployment
echo ========================================
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        exit /b 1
    )
    echo ✅ Dependencies installed
    echo.
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call npm run clean
if errorlevel 1 (
    echo ❌ Clean failed
    exit /b 1
)
echo ✅ Clean complete
echo.

REM Build the site
echo 🔨 Building Gatsby site...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build complete
echo.

REM Deploy to GitHub Pages
echo 📤 Deploying to GitHub Pages...
call npm run deploy
if errorlevel 1 (
    echo ❌ Deployment failed
    exit /b 1
)
echo.
echo ✅ Deployment complete!
echo.
echo 🌐 Your site will be available at: https://decisionsdev.github.io
echo ⏱️  It may take a few minutes for changes to appear
echo.
pause

@REM Made with Bob
