#!/bin/bash

# Pre-Deployment Checklist Script
# Validates that everything is ready for production deployment

echo "🔍 Pre-Deployment Checklist"
echo "============================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Function to check
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "1️⃣  Checking Environment Variables..."
echo "-----------------------------------"

# Check .env file exists
if [ -f .env ]; then
    check_pass ".env file exists"
    
    # Load .env
    source .env
    
    # Check critical variables
    if [ ! -z "$ADMIN_SECRET" ] && [ ${#ADMIN_SECRET} -ge 32 ]; then
        check_pass "ADMIN_SECRET is set and strong (${#ADMIN_SECRET} chars)"
    else
        check_fail "ADMIN_SECRET is missing or too weak (need 32+ chars)"
    fi
    
    if [[ $STRIPE_SECRET_KEY == sk_live_* ]]; then
        check_pass "Stripe SECRET_KEY is production key"
    elif [[ $STRIPE_SECRET_KEY == sk_test_* ]]; then
        check_fail "Stripe SECRET_KEY is still TEST key!"
    else
        check_fail "Stripe SECRET_KEY is missing"
    fi
    
    if [[ $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY == pk_live_* ]]; then
        check_pass "Stripe PUBLISHABLE_KEY is production key"
    elif [[ $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY == pk_test_* ]]; then
        check_fail "Stripe PUBLISHABLE_KEY is still TEST key!"
    else
        check_fail "Stripe PUBLISHABLE_KEY is missing"
    fi
    
    if [ ! -z "$STRIPE_WEBHOOK_SECRET" ]; then
        check_pass "Stripe WEBHOOK_SECRET is set"
    else
        check_warn "Stripe WEBHOOK_SECRET is missing"
    fi
    
    if [ ! -z "$PAYTR_MERCHANT_ID" ]; then
        check_pass "PayTR MERCHANT_ID is set"
    else
        check_warn "PayTR MERCHANT_ID is missing (optional)"
    fi
    
    if [[ $PAYTR_TEST_MODE == "false" ]]; then
        check_pass "PayTR is in production mode"
    elif [[ $PAYTR_TEST_MODE == "true" ]]; then
        check_warn "PayTR is still in TEST mode"
    fi
    
    if [ ! -z "$DATABASE_URL" ]; then
        check_pass "DATABASE_URL is set"
    else
        check_fail "DATABASE_URL is missing"
    fi
    
    if [[ $NEXT_PUBLIC_APP_URL == https://* ]]; then
        check_pass "NEXT_PUBLIC_APP_URL uses HTTPS"
    elif [[ $NEXT_PUBLIC_APP_URL == http://localhost* ]]; then
        check_fail "NEXT_PUBLIC_APP_URL is still localhost!"
    else
        check_fail "NEXT_PUBLIC_APP_URL doesn't use HTTPS"
    fi
    
else
    check_fail ".env file not found"
fi

echo ""
echo "2️⃣  Checking Dependencies..."
echo "----------------------------"

if [ -d "node_modules" ]; then
    check_pass "node_modules exists"
else
    check_fail "node_modules not found - run npm install"
fi

if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists"
else
    check_warn "package-lock.json not found"
fi

echo ""
echo "3️⃣  Checking Build..."
echo "---------------------"

echo "Building application..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "Build successful"
else
    check_fail "Build failed - check errors above"
fi

echo ""
echo "4️⃣  Checking Tests..."
echo "---------------------"

echo "Running tests..."
npm test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    check_pass "All tests passing"
else
    check_warn "Some tests failing - review before deploying"
fi

echo ""
echo "5️⃣  Checking Git Status..."
echo "--------------------------"

if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    if [ -f ".gitignore" ]; then
        if grep -q ".env" .gitignore; then
            check_pass ".env is in .gitignore"
        else
            check_fail ".env is NOT in .gitignore!"
        fi
    fi
    
    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        check_pass "No uncommitted changes"
    else
        check_warn "You have uncommitted changes"
    fi
else
    check_warn "Not a git repository"
fi

echo ""
echo "6️⃣  Security Checks..."
echo "----------------------"

if [ -f "next.config.ts" ]; then
    if grep -q "Strict-Transport-Security" next.config.ts; then
        check_pass "Security headers configured"
    else
        check_warn "Security headers not found in next.config.ts"
    fi
fi

echo ""
echo "================================"
echo "📊 Summary"
echo "================================"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to Vercel: vercel --prod"
    echo "2. Configure webhooks in Stripe/PayTR dashboards"
    echo "3. Test with real payment"
    exit 0
else
    echo -e "${RED}❌ Fix errors before deploying!${NC}"
    exit 1
fi
