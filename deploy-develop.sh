#!/bin/bash
# Deploy to develop environment (ssi-builders)
set -e

echo "🔧 Deploying SSI Builders to DEVELOP..."
echo "Branch: develop"
echo "Target: develop.builders.ssi.at"
echo ""

# Ensure we're on develop branch
git checkout develop

# Build
npm run build

# Deploy to Cloudflare Pages (develop branch)
npx wrangler pages deploy dist --project-name=ssi-builders --branch=develop

echo ""
echo "✅ Deploy complete!"
echo "🔗 https://develop.builders.ssi.at"
