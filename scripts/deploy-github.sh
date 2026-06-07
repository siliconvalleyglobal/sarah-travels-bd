#!/bin/sh
# Push to GitHub — run after creating an empty repo on github.com
# Usage: ./scripts/deploy-github.sh YOUR_GITHUB_USERNAME/sarah-travels-bd

set -e
REPO="${1:?Usage: ./scripts/deploy-github.sh owner/repo-name}"

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/${REPO}.git"
git branch -M main
git push -u origin main

echo ""
echo "Done! Repo pushed to https://github.com/${REPO}"
echo "Next: connect this repo in Railway → New Project → Deploy from GitHub"
