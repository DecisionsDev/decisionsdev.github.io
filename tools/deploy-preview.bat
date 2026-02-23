@echo off
REM Deploy DecisionsDev Preview to GitHub Enterprise
REM This script builds the Gatsby site and deploys it to a private preview repository

echo.
echo 🔍 DecisionsDev Preview Deployment
echo ====================================
echo.

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check if preview remote exists
git remote | findstr /r "^preview$" >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: 'preview' remote not configured.
    echo.
    echo Please add the preview remote first:
    echo   git remote add preview https://your-ghe-instance.com/DecisionsDev/decisionsdev-preview.git
    echo.
    echo Replace 'your-ghe-instance.com' with your actual GHE hostname.
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

REM Fetch and categorize repositories
echo 📚 Fetching and categorizing repositories...
call npm run build:repos
if errorlevel 1 (
    echo ❌ Repository fetch failed
    exit /b 1
)
echo ✅ Repositories updated
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

REM Deploy to preview repository
echo 📤 Deploying to preview repository...
call npx gh-pages -d public -r preview
if errorlevel 1 (
    echo ❌ Deployment failed
    exit /b 1
)
echo.
echo ✅ Preview deployment complete!
echo.
echo 🔍 Your preview site will be available at:
echo    https://your-ghe-instance.com/pages/DecisionsDev/decisionsdev-preview/
echo.
echo ⏱️  It may take a few minutes for changes to appear
echo 👥 Share this URL with reviewers who have been granted access
echo.
pause

@REM Made with Bob