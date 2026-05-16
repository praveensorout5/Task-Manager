#!/bin/sh

# Sync database schema
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set!"
  exit 1
fi

# Print safe debug info about DATABASE_URL
DB_PROTOCOL=$(echo $DATABASE_URL | cut -d: -f1)
echo "📂 DATABASE_URL protocol detected: $DB_PROTOCOL"

# Switch provider to postgresql for production (Railway)
# This allows the same repo to work with SQLite locally and Postgres on Railway
echo "🌐 Environment: $NODE_ENV"
if [ "$DB_PROTOCOL" = "postgresql" ] || [ "$DB_PROTOCOL" = "postgres" ]; then
  echo "🔄 Switching Prisma provider to postgresql..."
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
elif [ "$DB_PROTOCOL" = "file" ]; then
  echo "💾 Using SQLite provider..."
  sed -i 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma
else
  echo "⚠️ Warning: Unknown database protocol ($DB_PROTOCOL). Defaulting to current schema provider."
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
