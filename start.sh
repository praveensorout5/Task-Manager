#!/bin/sh

# Sync database schema
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set!"
else
  echo "✅ DATABASE_URL is set (Length: ${#DATABASE_URL})"
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
