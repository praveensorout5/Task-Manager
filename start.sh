#!/bin/sh

# Sync database schema
npx prisma db push --accept-data-loss

# Seed database if it's the first time (optional)
# node prisma/seed.mjs

# Start the application
npm start
