# Domain Güncelleme Script'i
# BS3CRAFTS.COM için environment variable güncelleme

Write-Host "🌐 Domain Güncelleme Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# Vercel CLI kontrolü
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI yüklü değil!" -ForegroundColor Red
    Write-Host "Yüklemek için: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel CLI bulundu" -ForegroundColor Green
Write-Host ""

# Environment variable güncelleme
Write-Host "📝 Environment Variable Güncelleniyor..." -ForegroundColor Cyan

# Production environment
Write-Host "Production için NEXT_PUBLIC_SITE_URL güncelleniyor..." -ForegroundColor Yellow
vercel env rm NEXT_PUBLIC_SITE_URL production --yes
vercel env add NEXT_PUBLIC_SITE_URL production

Write-Host ""
Write-Host "Yeni değer: https://bs3dcrafts.com" -ForegroundColor Cyan
Write-Host ""

# Preview environment
Write-Host "Preview için NEXT_PUBLIC_SITE_URL güncelleniyor..." -ForegroundColor Yellow
vercel env rm NEXT_PUBLIC_SITE_URL preview --yes
vercel env add NEXT_PUBLIC_SITE_URL preview

Write-Host ""
Write-Host "Yeni değer: https://bs3dcrafts.com" -ForegroundColor Cyan
Write-Host ""

# Development environment
Write-Host "Development için NEXT_PUBLIC_SITE_URL güncelleniyor..." -ForegroundColor Yellow
vercel env rm NEXT_PUBLIC_SITE_URL development --yes
vercel env add NEXT_PUBLIC_SITE_URL development

Write-Host ""
Write-Host "Yeni değer: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Environment Variable'lar güncellendi!" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 Yeni deployment tetikleniyor..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✅ Domain güncelleme tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Yeni site URL'i: https://bs3dcrafts.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Yapılacaklar:" -ForegroundColor Yellow
Write-Host "  1. Stripe webhook URL'i güncelle: https://bs3dcrafts.com/api/webhooks/stripe" -ForegroundColor White
Write-Host "  2. PayTR callback URL'i güncelle: https://bs3dcrafts.com/api/webhooks/paytr" -ForegroundColor White
Write-Host "  3. Google Search Console'a domain ekle" -ForegroundColor White
Write-Host "  4. DNS propagation kontrol et: https://dnschecker.org" -ForegroundColor White
Write-Host ""
