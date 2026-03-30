# Pre-Deployment Checklist Script (PowerShell)
# Validates that everything is ready for production deployment

Write-Host "🔍 Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$ERRORS = 0
$WARNINGS = 0

function Check-Pass {
    param($message)
    Write-Host "✅ $message" -ForegroundColor Green
}

function Check-Fail {
    param($message)
    Write-Host "❌ $message" -ForegroundColor Red
    $script:ERRORS++
}

function Check-Warn {
    param($message)
    Write-Host "⚠️  $message" -ForegroundColor Yellow
    $script:WARNINGS++
}

Write-Host "1️⃣  Checking Environment Variables..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

# Check .env file exists
if (Test-Path .env) {
    Check-Pass ".env file exists"
    
    # Load .env
    $envVars = @{}
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $envVars[$matches[1]] = $matches[2].Trim('"')
        }
    }
    
    # Check critical variables
    if ($envVars['ADMIN_SECRET'] -and $envVars['ADMIN_SECRET'].Length -ge 32) {
        Check-Pass "ADMIN_SECRET is set and strong ($($envVars['ADMIN_SECRET'].Length) chars)"
    } else {
        Check-Fail "ADMIN_SECRET is missing or too weak (need 32+ chars)"
    }
    
    if ($envVars['STRIPE_SECRET_KEY'] -like 'sk_live_*') {
        Check-Pass "Stripe SECRET_KEY is production key"
    } elseif ($envVars['STRIPE_SECRET_KEY'] -like 'sk_test_*') {
        Check-Fail "Stripe SECRET_KEY is still TEST key!"
    } else {
        Check-Fail "Stripe SECRET_KEY is missing"
    }
    
    if ($envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] -like 'pk_live_*') {
        Check-Pass "Stripe PUBLISHABLE_KEY is production key"
    } elseif ($envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] -like 'pk_test_*') {
        Check-Fail "Stripe PUBLISHABLE_KEY is still TEST key!"
    } else {
        Check-Fail "Stripe PUBLISHABLE_KEY is missing"
    }
    
    if ($envVars['STRIPE_WEBHOOK_SECRET']) {
        Check-Pass "Stripe WEBHOOK_SECRET is set"
    } else {
        Check-Warn "Stripe WEBHOOK_SECRET is missing"
    }
    
    if ($envVars['PAYTR_MERCHANT_ID']) {
        Check-Pass "PayTR MERCHANT_ID is set"
    } else {
        Check-Warn "PayTR MERCHANT_ID is missing (optional)"
    }
    
    if ($envVars['PAYTR_TEST_MODE'] -eq 'false') {
        Check-Pass "PayTR is in production mode"
    } elseif ($envVars['PAYTR_TEST_MODE'] -eq 'true') {
        Check-Warn "PayTR is still in TEST mode"
    }
    
    if ($envVars['DATABASE_URL']) {
        Check-Pass "DATABASE_URL is set"
    } else {
        Check-Fail "DATABASE_URL is missing"
    }
    
    if ($envVars['NEXT_PUBLIC_APP_URL'] -like 'https://*') {
        Check-Pass "NEXT_PUBLIC_APP_URL uses HTTPS"
    } elseif ($envVars['NEXT_PUBLIC_APP_URL'] -like 'http://localhost*') {
        Check-Fail "NEXT_PUBLIC_APP_URL is still localhost!"
    } else {
        Check-Fail "NEXT_PUBLIC_APP_URL doesn't use HTTPS"
    }
    
} else {
    Check-Fail ".env file not found"
}

Write-Host ""
Write-Host "2️⃣  Checking Dependencies..." -ForegroundColor Cyan
Write-Host "----------------------------"

if (Test-Path "node_modules") {
    Check-Pass "node_modules exists"
} else {
    Check-Fail "node_modules not found - run npm install"
}

if (Test-Path "package-lock.json") {
    Check-Pass "package-lock.json exists"
} else {
    Check-Warn "package-lock.json not found"
}

Write-Host ""
Write-Host "3️⃣  Checking Build..." -ForegroundColor Cyan
Write-Host "---------------------"

Write-Host "Building application..."
npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Check-Pass "Build successful"
} else {
    Check-Fail "Build failed - check errors above"
}

Write-Host ""
Write-Host "4️⃣  Checking Tests..." -ForegroundColor Cyan
Write-Host "---------------------"

Write-Host "Running tests..."
npm test 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Check-Pass "All tests passing"
} else {
    Check-Warn "Some tests failing - review before deploying"
}

Write-Host ""
Write-Host "5️⃣  Checking Git Status..." -ForegroundColor Cyan
Write-Host "--------------------------"

if (Test-Path ".git") {
    Check-Pass "Git repository initialized"
    
    if (Test-Path ".gitignore") {
        $gitignore = Get-Content .gitignore -Raw
        if ($gitignore -match '\.env') {
            Check-Pass ".env is in .gitignore"
        } else {
            Check-Fail ".env is NOT in .gitignore!"
        }
    }
    
    # Check for uncommitted changes
    $status = git status --porcelain
    if ([string]::IsNullOrEmpty($status)) {
        Check-Pass "No uncommitted changes"
    } else {
        Check-Warn "You have uncommitted changes"
    }
} else {
    Check-Warn "Not a git repository"
}

Write-Host ""
Write-Host "6️⃣  Security Checks..." -ForegroundColor Cyan
Write-Host "----------------------"

if (Test-Path "next.config.ts") {
    $config = Get-Content next.config.ts -Raw
    if ($config -match 'Strict-Transport-Security') {
        Check-Pass "Security headers configured"
    } else {
        Check-Warn "Security headers not found in next.config.ts"
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Errors: $ERRORS" -ForegroundColor $(if ($ERRORS -eq 0) { 'Green' } else { 'Red' })
Write-Host "Warnings: $WARNINGS" -ForegroundColor $(if ($WARNINGS -eq 0) { 'Green' } else { 'Yellow' })
Write-Host ""

if ($ERRORS -eq 0) {
    Write-Host "🎉 Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Deploy to Vercel: vercel --prod"
    Write-Host "2. Configure webhooks in Stripe/PayTR dashboards"
    Write-Host "3. Test with real payment"
    exit 0
} else {
    Write-Host "❌ Fix errors before deploying!" -ForegroundColor Red
    exit 1
}
