#!/bin/sh

# Sync database schema
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set!"
  exit 1
fi

# Switch provider to postgresql for production (Railway)
# This allows the same repo to work with SQLite locally and Postgres on Railway
echo "🌐 Environment: $NODE_ENV"
if [ "$NODE_ENV" = "production" ] || [ -n "$RAILWAY_ENVIRONMENT" ]; then
  echo "🔄 Switching Prisma provider to postgresql for production..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
fi

echo "🔄 Syncing database schema..."
npx prisma db push --accept-data-loss

# Generate client
echo "🛠 Generating Prisma client..."
npx prisma generate

# Seed database
# Note: In a production environment, you might want to run this manually 
# but for this demo, we'll run it to ensure the admin account exists.
echo "🌱 Seeding database..."
node prisma/seed.mjs

# Start the application
echo "🚀 Starting TaskFlow..."
npm start
