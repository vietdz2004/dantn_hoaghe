#!/bin/bash

# Git Workflow Setup Script for Hoashop
# This script sets up Git workflow and initial configuration

echo "🌸 Setting up Git workflow for Hoashop..."

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a Git repository. Please run 'git init' first."
    exit 1
fi

echo "✅ Git is installed and repository is initialized"

# Configure Git user (if not already configured)
echo "🔧 Configuring Git user..."
read -p "Enter your name: " user_name
read -p "Enter your email: " user_email

git config user.name "$user_name"
git config user.email "$user_email"

echo "✅ Git user configured: $user_name <$user_email>"

# Create main branch if it doesn't exist
if ! git show-ref --verify --quiet refs/heads/main; then
    echo "🌳 Creating main branch..."
    git checkout -b main
else
    echo "✅ Main branch already exists"
fi

# Create develop branch
echo "🌳 Creating develop branch..."
git checkout -b develop

# Create initial commit if no commits exist
if [ -z "$(git log --oneline -n 1 2>/dev/null)" ]; then
    echo "📝 Creating initial commit..."
    git add .
    git commit -m "feat: initial project setup"
fi

# Create feature branch template
echo "🌳 Creating feature branch template..."
git checkout -b feature/template

# Create a template file
cat > .git/templates/feature-template.md << EOF
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
EOF

# Switch back to develop
git checkout develop

# Delete template branch
git branch -D feature/template

echo "✅ Git workflow setup completed!"

# Display current status
echo ""
echo "📊 Current Git Status:"
echo "======================"
git status
echo ""
echo "🌳 Available branches:"
git branch -a
echo ""
echo "📝 Recent commits:"
git log --oneline -5
echo ""
echo "🎯 Next steps:"
echo "1. Create a feature branch: git checkout -b feature/your-feature-name"
echo "2. Make your changes and commit: git commit -m 'feat: your feature description'"
echo "3. Push your branch: git push origin feature/your-feature-name"
echo "4. Create a Pull Request on GitHub/GitLab"
echo ""
echo "📚 For more information, see docs/GIT_WORKFLOW.md" 