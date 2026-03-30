#!/bin/bash

# Database Deployment Script
# Run this script to set up production database

echo "🗄️  Database Deployment Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please run setup-production.sh first"
    exit 1
fi

# Load environment variables
source .env

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not set in .env${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  This will run migrations on your production database${NC}"
read -p "Are you sure you want to continue? (yes/no) " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "1️⃣  Generating Prisma Client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Prisma client generated${NC}"

echo ""
echo "2️⃣  Running database migrations..."
npm run db:migrate
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Migrations completed${NC}"

echo ""
echo "3️⃣  Checking database connection..."
npx prisma db pull --force
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Database connection successful${NC}"

echo ""
echo -e "${GREEN}🎉 Database deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Verify tables in database"
echo "2. Run seed data if needed: npm run db:seed"
echo "3. Deploy application"
