# Vercel Environment Variables Ekleme Script'i
# Bu script .env dosyanızdaki tüm değişkenleri Vercel'e ekler

Write-Host "🚀 Vercel Environment Variables Ekleme" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# .env dosyasını oku
if (-not (Test-Path .env)) {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "📝 .env dosyası okunuyor..." -ForegroundColor Yellow

# Environment variables listesi
$envVars = @{
    "DATABASE_URL" = ""
    "DIRECT_URL" = ""
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" = ""
    "STRIPE_SECRET_KEY" = ""
    "STRIPE_WEBHOOK_SECRET" = ""
    "NEXT_PUBLIC_SUPABASE_URL" = ""
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = ""
    "SUPABASE_SERVICE_ROLE_KEY" = ""
    "ADMIN_SECRET" = ""
    "NEXT_PUBLIC_SITE_URL" = ""
    "NEXT_PUBLIC_APP_URL" = ""
}

# .env dosyasından değerleri oku
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        
        if ($envVars.ContainsKey($key)) {
            $envVars[$key] = $value
        }
    }
}

Write-Host ""
Write-Host "🔍 Bulunan değişkenler:" -ForegroundColor Green
$envVars.GetEnumerator() | ForEach-Object {
    if ($_.Value) {
        $maskedValue = if ($_.Value.Length -gt 20) { 
            $_.Value.Substring(0, 20) + "..." 
        } else { 
            $_.Value 
        }
        Write-Host "  ✅ $($_.Key) = $maskedValue" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  $($_.Key) = (boş)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "⚠️  UYARI: Bu işlem Vercel'e environment variables ekleyecek" -ForegroundColor Yellow
Write-Host "Production environment'ına eklenecek" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Devam etmek istiyor musunuz? (evet/hayir)"
if ($confirm -ne "evet") {
    Write-Host "İptal edildi." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📤 Vercel'e ekleniyor..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($var in $envVars.GetEnumerator()) {
    $key = $var.Key
    $value = $var.Value
    
    if (-not $value) {
        Write-Host "⏭️  $key atlanıyor (boş değer)" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "📝 $key ekleniyor..." -ForegroundColor Gray
    
    # Vercel'e ekle
    $output = echo $value | vercel env add $key production 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $key eklendi" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  ❌ $key eklenemedi: $output" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📊 Özet" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Başarılı: $successCount" -ForegroundColor Green
Write-Host "❌ Başarısız: $failCount" -ForegroundColor Red
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Environment variables eklendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Sonraki adımlar:" -ForegroundColor Cyan
    Write-Host "1. Vercel Dashboard'da kontrol edin:"
    Write-Host "   https://vercel.com/berkinunverr63-2960s-projects/bs3dcrafts/settings/environment-variables"
    Write-Host ""
    Write-Host "2. Production'a redeploy edin:"
    Write-Host "   vercel --prod"
    Write-Host ""
}
