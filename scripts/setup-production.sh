#!/bin/bash

# Production Setup Script for BS3DCRAFTS
# This script helps you set up production environment variables

echo "🚀 BS3DCRAFTS Production Setup"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file already exists!${NC}"
    read -p "Do you want to backup and create a new one? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo -e "${GREEN}✅ Backup created${NC}"
    else
        echo "Exiting..."
        exit 0
    fi
fi

# Create .env file
echo "Creating .env file..."
cp .env.example .env

echo ""
echo "📝 Please provide the following information:"
echo ""

# Generate ADMIN_SECRET
echo -e "${GREEN}Generating secure ADMIN_SECRET...${NC}"
ADMIN_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "PLEASE_GENERATE_MANUALLY")
echo "ADMIN_SECRET: $ADMIN_SECRET"
echo ""

# Stripe
echo "🔵 Stripe Configuration"
echo "Get your keys from: https://dashboard.stripe.com/apikeys"
read -p "Stripe Secret Key (sk_live_...): " STRIPE_SECRET_KEY
read -p "Stripe Publishable Key (pk_live_...): " STRIPE_PUBLISHABLE_KEY
read -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
echo ""

# PayTR
echo "🟢 PayTR Configuration"
echo "Get your credentials from: https://www.paytr.com"
read -p "PayTR Merchant ID: " PAYTR_MERCHANT_ID
read -p "PayTR Merchant Key: " PAYTR_MERCHANT_KEY
read -p "PayTR Merchant Salt: " PAYTR_MERCHANT_SALT
read -p "PayTR Test Mode (true/false): " PAYTR_TEST_MODE
echo ""

# Database
echo "🗄️  Database Configuration"
echo "Get connection string from your database provider"
read -p "Database URL (postgresql://...): " DATABASE_URL
read -p "Direct URL (postgresql://...): " DIRECT_URL
echo ""

# Supabase
echo "📦 Supabase Configuration"
echo "Get from: https://app.supabase.com/project/_/settings/api"
read -p "Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
echo ""

# Site URLs
echo "🌐 Site Configuration"
read -p "Production Site URL (https://yourdomain.com): " SITE_URL
echo ""

# Write to .env file
cat > .env << EOF
# Database - Production
DATABASE_URL="$DATABASE_URL"
DIRECT_URL="$DIRECT_URL"

# Stripe - Production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# PayTR - Production
PAYTR_MERCHANT_ID=$PAYTR_MERCHANT_ID
PAYTR_MERCHANT_KEY=$PAYTR_MERCHANT_KEY
PAYTR_MERCHANT_SALT=$PAYTR_MERCHANT_SALT
PAYTR_TEST_MODE=$PAYTR_TEST_MODE

# Supabase Storage & Auth
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

# Admin
ADMIN_SECRET=$ADMIN_SECRET

# Site
NEXT_PUBLIC_SITE_URL=$SITE_URL
NEXT_PUBLIC_APP_URL=$SITE_URL
EOF

echo ""
echo -e "${GREEN}✅ .env file created successfully!${NC}"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "1. Never commit .env file to git"
echo "2. Keep your API keys secure"
echo "3. Use different keys for development and production"
echo "4. Rotate keys regularly"
echo ""
echo "📋 Next Steps:"
echo "1. Review .env file: cat .env"
echo "2. Run database migrations: npm run db:migrate"
echo "3. Build the application: npm run build"
echo "4. Deploy to production"
echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
