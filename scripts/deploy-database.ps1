# Database Deployment Script (PowerShell)
# Run this script to set up production database

Write-Host "🗄️  Database Deployment Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please run setup-production.ps1 first"
    exit 1
}

# Load environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ DATABASE_URL not set in .env" -ForegroundColor Red
    exit 1
}

Write-Host "⚠️  This will run migrations on your production database" -ForegroundColor Yellow
$confirm = Read-Host "Are you sure you want to continue? (yes/no)"
if ($confirm -ne 'yes') {
    Write-Host "Cancelled."
    exit 0
}

Write-Host ""
Write-Host "1️⃣  Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green

Write-Host ""
Write-Host "2️⃣  Running database migrations..." -ForegroundColor Cyan
npm run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Migrations completed" -ForegroundColor Green

Write-Host ""
Write-Host "3️⃣  Checking database connection..." -ForegroundColor Cyan
npx prisma db pull --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database connection successful" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Database deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify tables in database"
Write-Host "2. Run seed data if needed: npm run db:seed"
Write-Host "3. Deploy application"
