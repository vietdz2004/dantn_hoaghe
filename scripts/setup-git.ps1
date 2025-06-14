# Git Workflow Setup Script for Hoashop (PowerShell)
# This script sets up Git workflow and initial configuration

Write-Host "🌸 Setting up Git workflow for Hoashop..." -ForegroundColor Green

# Check if Git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a Git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a Git repository. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Git repository is initialized" -ForegroundColor Green

# Configure Git user (if not already configured)
Write-Host "🔧 Configuring Git user..." -ForegroundColor Yellow
$userName = Read-Host "Enter your name"
$userEmail = Read-Host "Enter your email"

git config user.name $userName
git config user.email $userEmail

Write-Host "✅ Git user configured: $userName <$userEmail>" -ForegroundColor Green

# Create main branch if it doesn't exist
$mainExists = git show-ref --verify --quiet refs/heads/main 2>$null
if (-not $mainExists) {
    Write-Host "🌳 Creating main branch..." -ForegroundColor Yellow
    git checkout -b main
} else {
    Write-Host "✅ Main branch already exists" -ForegroundColor Green
}

# Create develop branch
Write-Host "🌳 Creating develop branch..." -ForegroundColor Yellow
git checkout -b develop

# Create initial commit if no commits exist
$lastCommit = git log --oneline -n 1 2>$null
if (-not $lastCommit) {
    Write-Host "📝 Creating initial commit..." -ForegroundColor Yellow
    git add .
    git commit -m "feat: initial project setup"
}

# Create feature branch template
Write-Host "🌳 Creating feature branch template..." -ForegroundColor Yellow
git checkout -b feature/template

# Create a template file
$templateContent = @"
# Feature Template

## Description
Brief description of the feature

## Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested
"@

# Create templates directory if it doesn't exist
if (-not (Test-Path ".git/templates")) {
    New-Item -ItemType Directory -Path ".git/templates" -Force | Out-Null
}

$templateContent | Out-File -FilePath ".git/templates/feature-template.md" -Encoding UTF8

# Switch back to develop
git checkout develop

# Delete template branch
git branch -D feature/template

Write-Host "✅ Git workflow setup completed!" -ForegroundColor Green

# Display current status
Write-Host ""
Write-Host "📊 Current Git Status:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "🌳 Available branches:" -ForegroundColor Cyan
git branch -a

Write-Host ""
Write-Host "📝 Recent commits:" -ForegroundColor Cyan
git log --oneline -5

Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "1. Create a feature branch: git checkout -b feature/your-feature-name" -ForegroundColor White
Write-Host "2. Make your changes and commit: git commit -m 'feat: your feature description'" -ForegroundColor White
Write-Host "3. Push your branch: git push origin feature/your-feature-name" -ForegroundColor White
Write-Host "4. Create a Pull Request on GitHub/GitLab" -ForegroundColor White

Write-Host ""
Write-Host "📚 For more information, see docs/GIT_WORKFLOW.md" -ForegroundColor Blue 