# Vercel Environment Variables Kurulumu

PayTR entegrasyonunun production'da çalışması için aşağıdaki environment variables'ları Vercel dashboard'unda ayarlamanız gerekiyor.

## 🔧 Vercel Dashboard'da Ayarlanacak Environment Variables

### 1. Vercel Dashboard'a Giriş
1. https://vercel.com/dashboard adresine gidin
2. BS3DCrafts projenizi seçin
3. Settings > Environment Variables sekmesine gidin

### 2. PayTR Environment Variables

Aşağıdaki değişkenleri **Production**, **Preview** ve **Development** ortamları için ekleyin:

```
PAYTR_MERCHANT_ID=688326
PAYTR_MERCHANT_KEY=L41xQS1JDRCr7x5Z
PAYTR_MERCHANT_SALT=jRLqR8GFAuW7Dfop
PAYTR_TEST_MODE=true
```

### 3. App URL Variables

```
NEXT_PUBLIC_APP_URL=https://bs3dcrafts.vercel.app
NEXT_PUBLIC_SITE_URL=https://bs3dcrafts.vercel.app
NEXT_PUBLIC_BASE_URL=https://bs3dcrafts.vercel.app
```

### 4. Diğer Gerekli Variables

Eğer eksikse aşağıdakileri de ekleyin:

```
DATABASE_URL=postgresql://postgres.jiutbqwwjkzjwzhxmgnw:414235BrknSld@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.jiutbqwwjkzjwzhxmgnw:414235BrknSld@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
ADMIN_SECRET=AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=
JWT_SECRET=Xk9mP2vL8nQ4wR7tY6uI3oP5aS1dF0gH9jK2lZ4xC8vB6nM3qW5eR7tY9uI1oP3a
NEXT_PUBLIC_SUPABASE_URL=https://jiutbqwwjkzjwzhxmgnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdXRicXd3amt6and6aHhtZ253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Mzc1OTcsImV4cCI6MjA5MDMxMzU5N30.fbrI3u8yx5VmscYWf1lugDY65UAjb8PzhzsXgU6_Duw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdXRicXd3amt6and6aHhtZ253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDczNzU5NywiZXhwIjoyMDkwMzEzNTk3fQ.TkgXsHGMOxEZUtMc-NaB5-WxofJdwavDO2XTO5H6Mgc
```

## 🚀 Deployment Sonrası Test

Environment variables'ları ekledikten sonra:

1. Projeyi yeniden deploy edin (Vercel otomatik deploy yapacak)
2. Aşağıdaki URL'i test edin:
   ```
   https://bs3dcrafts.vercel.app/api/debug/paytr-status
   ```
3. Bu endpoint size environment variables'ların doğru yüklenip yüklenmediğini gösterecek

## 🔍 Debug Endpoint Kullanımı

Production'da sorun yaşıyorsanız debug endpoint'ini kullanın:

```bash
curl https://bs3dcrafts.vercel.app/api/debug/paytr-status
```

Bu size şunları gösterecek:
- Environment variables durumu
- PayTR API bağlantısı
- Konfigürasyon sorunları

## ⚠️ Güvenlik Notları

1. **Sensitive Data**: Merchant Key ve Salt gibi hassas bilgileri sadece Vercel environment variables'ında saklayın
2. **Test Mode**: Production'da `PAYTR_TEST_MODE=true` kullanın (gerçek ödemeler için false yapın)
3. **HTTPS**: PayTR webhook'ları sadece HTTPS URL'leri kabul eder

## 🔧 Sorun Giderme

### Yaygın Sorunlar:

1. **"Ödeme işlemi başlatılamadı" Hatası**
   - Environment variables eksik veya yanlış
   - PayTR API'sine erişim sorunu
   - Merchant bilgileri hatalı

2. **Webhook Çalışmıyor**
   - PayTR panelinde webhook URL'i yanlış
   - HTTPS sertifikası sorunu
   - Hash doğrulama hatası

3. **Token Alınamıyor**
   - Merchant ID/Key/Salt hatalı
   - PayTR API'si erişilemez durumda
   - Request formatı yanlış

### Debug Adımları:

1. Debug endpoint'ini kontrol edin
2. Vercel logs'ları inceleyin
3. PayTR merchant panelini kontrol edin
4. Network bağlantısını test edin

## 📞 Destek

Sorun devam ederse:
1. Debug endpoint çıktısını paylaşın
2. Vercel logs'larını kontrol edin
3. PayTR merchant panelindeki hata loglarını inceleyin