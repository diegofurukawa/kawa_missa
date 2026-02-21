#!/bin/sh
set -e

echo "Starting Next.js application on port ${PORT}..."
exec npx next start --port "${PORT}" --hostname "${HOSTNAME:-0.0.0.0}"
