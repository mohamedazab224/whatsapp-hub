#!/bin/bash

echo "🧹 Cleaning WhatsApp Hub project..."

# Remove build artifacts
rm -rf .next
rm -rf .turbo
rm -rf dist
rm -rf build
rm -rf out

# Remove node_modules if needed (optional)
# rm -rf node_modules

# Remove temporary files
rm -f error.txt
rm -f fix-notes.txt

# Remove unused directories
rm -rf mobile-app 2>/dev/null || true

# Clear cache
rm -rf .cache
rm -rf .eslintcache

# Remove lock files if needed (optional - uncomment to use)
# rm -f pnpm-lock.yaml yarn.lock package-lock.json

echo "✅ Project cleaned successfully!"
echo "📦 To rebuild, run: npm install && npm run build"
