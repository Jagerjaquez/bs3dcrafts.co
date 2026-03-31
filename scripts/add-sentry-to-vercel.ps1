# Sentry Environment Variables - Vercel'e Ekleme Script'i
# Bu script'i çalıştırmak için PowerShell kullanın

Write-Host "=== Sentry Environment Variables - Vercel'e Ekleme ===" -ForegroundColor Cyan
Write-Host ""

# Sentry DSN
$sentryDsn = "https://a66b481c37410a1665df50c0c0e35201@o4511138756165632.ingest.de.sentry.io/4511138781921360"

Write-Host "1. NEXT_PUBLIC_SENTRY_DSN ekleniyor..." -ForegroundColor Yellow
Write-Host "   Value: $sentryDsn" -ForegroundColor Gray

# Vercel CLI ile environment variable ekle
# Not: Bu komut interaktif olduğu için manuel çalıştırmanız gerekebilir

Write-Host ""
Write-Host "=== Manuel Ekleme Talimatları ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vercel Dashboard'dan eklemek için:" -ForegroundColor Green
Write-Host "1. https://vercel.com adresine gidin" -ForegroundColor White
Write-Host "2. Projenizi seçin: bs3dcrafts" -ForegroundColor White
Write-Host "3. Settings > Environment Variables" -ForegroundColor White
Write-Host "4. Şu değişkeni ekleyin:" -ForegroundColor White
Write-Host ""
Write-Host "   Name: NEXT_PUBLIC_SENTRY_DSN" -ForegroundColor Cyan
Write-Host "   Value: $sentryDsn" -ForegroundColor Cyan
Write-Host "   Environment: Production, Preview, Development (hepsini seçin)" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. 'Save' butonuna tıklayın" -ForegroundColor White
Write-Host "6. Vercel otomatik redeploy yapacak" -ForegroundColor White
Write-Host ""
Write-Host "=== Test Etme ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deploy tamamlandıktan sonra test edin:" -ForegroundColor Green
Write-Host "https://bs3dcrafts.vercel.app/api/test-sentry" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sentry Dashboard'da error'ları kontrol edin:" -ForegroundColor Green
Write-Host "https://sentry.io" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Tamamlandı ===" -ForegroundColor Green
