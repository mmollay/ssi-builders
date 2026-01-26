#!/bin/bash
# Deploy to production environment (ssi-builders)
set -e

echo "🔧 Deploying SSI Builders to PRODUCTION..."
echo "Branch: main"
echo "Target: builders.ssi.at"
echo ""

# Ensure we're on main branch
git checkout main

# Merge develop into main
echo "📦 Merging develop into main..."
git merge develop --no-edit

# Build
npm run build

# Deploy to Cloudflare Pages (main branch = production)
npx wrangler pages deploy dist --project-name=ssi-builders --branch=main

# Push changes
git push origin main

echo ""
echo "✅ Production deploy complete!"
echo "🔗 https://builders.ssi.at"
