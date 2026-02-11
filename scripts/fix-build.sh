#!/bin/bash
set -e

echo "Removing node_modules, .next, and lock files..."
rm -rf node_modules .next pnpm-lock.yaml

echo "Build cache cleaned successfully!"
echo "Dependencies will be reinstalled automatically."
