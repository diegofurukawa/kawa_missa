#!/bin/sh
set -e

echo "Starting deployment script..."

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set, running database migrations..."
  # Ensure DATABASE_URL is exported for Prisma
  export DATABASE_URL

  # Temporarily disable exit on error for migration check
  set +e
  npx prisma migrate deploy > /tmp/migrate.log 2>&1
  MIGRATE_EXIT_CODE=$?
  set -e

  # Show migration output
  cat /tmp/migrate.log

  if [ $MIGRATE_EXIT_CODE -ne 0 ]; then
    # Check if error is P3005 (database not empty)
    if grep -q "P3005" /tmp/migrate.log; then
      echo "Database is not empty. Baselining all migrations..."
      # Mark all existing migrations as applied
      for migration in $(ls prisma/migrations); do
        if [ -d "prisma/migrations/$migration" ]; then
          echo "Marking migration as applied: $migration"
          npx prisma migrate resolve --applied "$migration" || true
        fi
      done
      # Now try to deploy any remaining migrations
      echo "Attempting to deploy migrations after baseline..."
      npx prisma migrate deploy
    # Check if error is P3009 (failed migration found)
    elif grep -q "P3009" /tmp/migrate.log; then
      echo "Failed migration detected. Resolving..."
      # Extract the failed migration name from the log
      FAILED_MIGRATION=$(grep "migration started at" /tmp/migrate.log | sed -n 's/.*`\([^`]*\)`.*/\1/p' | head -1)
      if [ -n "$FAILED_MIGRATION" ]; then
        echo "Marking failed migration as rolled back: $FAILED_MIGRATION"
        npx prisma migrate resolve --rolled-back "$FAILED_MIGRATION"
        echo "Attempting to deploy migrations after resolving..."
        npx prisma migrate deploy
      else
        echo "Could not identify failed migration"
        exit 1
      fi
    else
      echo "Migration failed with a different error (exit code: $MIGRATE_EXIT_CODE)"
      exit 1
    fi
  fi
else
  echo "DATABASE_URL not set, skipping migrations."
fi

echo "Starting Next.js application..."
node server.js
