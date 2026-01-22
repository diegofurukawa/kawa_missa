#!/bin/sh
echo "Starting deployment script..."

if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set, running database migrations..."
  export DATABASE_URL

  npx prisma migrate deploy

  if [ $? -ne 0 ]; then
    echo "Migration failed"
    exit 1
  fi
else
  echo "DATABASE_URL not set, skipping migrations."
fi

echo "Starting Next.js application..."
npx next start
