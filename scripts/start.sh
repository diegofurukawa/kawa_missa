#!/bin/sh
set -e

echo "Starting deployment script..."

if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  # We need to use the prisma binary directly or via npx if available in runner
  # In standalone mode, node_modules might be trimmed, but we copied the binary.
  ./node_modules/.bin/prisma migrate deploy
else
  echo "DATABASE_URL not set, skipping migrations."
fi

echo "Starting Next.js application..."
node server.js
