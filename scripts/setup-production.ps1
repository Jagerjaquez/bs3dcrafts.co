# Production Setup Script for BS3DCRAFTS (PowerShell)
# This script helps you set up production environment variables

Write-Host "🚀 BS3DCRAFTS Production Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path .env) {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $backup = Read-Host "Do you want to backup and create a new one? (y/n)"
    if ($backup -eq 'y' -or $backup -eq 'Y') {
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        Copy-Item .env ".env.backup.$timestamp"
        Write-Host "✅ Backup created" -ForegroundColor Green
    } else {
        Write-Host "Exiting..."
        exit
    }
}

# Create .env file
Write-Host "Creating .env file..."
Copy-Item .env.example .env

Write-Host ""
Write-Host "📝 Please provide the following information:" -ForegroundColor Cyan
Write-Host ""

# Generate ADMIN_SECRET
Write-Host "Generating secure ADMIN_SECRET..." -ForegroundColor Green
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$ADMIN_SECRET = [Convert]::ToBase64String($bytes)
Write-Host "ADMIN_SECRET: $ADMIN_SECRET" -ForegroundColor Yellow
Write-Host ""

# Stripe
Write-Host "🔵 Stripe Configuration" -ForegroundColor Blue
Write-Host "Get your keys from: https://dashboard.stripe.com/apikeys"
$STRIPE_SECRET_KEY = Read-Host "Stripe Secret Key (sk_live_...)"
$STRIPE_PUBLISHABLE_KEY = Read-Host "Stripe Publishable Key (pk_live_...)"
$STRIPE_WEBHOOK_SECRET = Read-Host "Stripe Webhook Secret (whsec_...)"
Write-Host ""

# PayTR
Write-Host "🟢 PayTR Configuration" -ForegroundColor Green
Write-Host "Get your credentials from: https://www.paytr.com"
$PAYTR_MERCHANT_ID = Read-Host "PayTR Merchant ID"
$PAYTR_MERCHANT_KEY = Read-Host "PayTR Merchant Key"
$PAYTR_MERCHANT_SALT = Read-Host "PayTR Merchant Salt"
$PAYTR_TEST_MODE = Read-Host "PayTR Test Mode (true/false)"
Write-Host ""

# Database
Write-Host "🗄️  Database Configuration" -ForegroundColor Cyan
Write-Host "Get connection string from your database provider"
$DATABASE_URL = Read-Host "Database URL (postgresql://...)"
$DIRECT_URL = Read-Host "Direct URL (postgresql://...)"
Write-Host ""

# Supabase
Write-Host "📦 Supabase Configuration" -ForegroundColor Magenta
Write-Host "Get from: https://app.supabase.com/project/_/settings/api"
$SUPABASE_URL = Read-Host "Supabase URL (https://xxx.supabase.co)"
$SUPABASE_ANON_KEY = Read-Host "Supabase Anon Key"
$SUPABASE_SERVICE_ROLE_KEY = Read-Host "Supabase Service Role Key"
Write-Host ""

# Site URLs
Write-Host "🌐 Site Configuration" -ForegroundColor Cyan
$SITE_URL = Read-Host "Production Site URL (https://yourdomain.com)"
Write-Host ""

# Write to .env file
$envContent = @"
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
"@

$envContent | Out-File -FilePath .env -Encoding UTF8

Write-Host ""
Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT SECURITY NOTES:" -ForegroundColor Yellow
Write-Host "1. Never commit .env file to git"
Write-Host "2. Keep your API keys secure"
Write-Host "3. Use different keys for development and production"
Write-Host "4. Rotate keys regularly"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review .env file: cat .env"
Write-Host "2. Run database migrations: npm run db:migrate"
Write-Host "3. Build the application: npm run build"
Write-Host "4. Deploy to production"
Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
