# 🚀 Deployment Guide - Adım Adım

Bu rehber, BS3DCRAFTS platformunu production'a çıkarmak için gereken tüm adımları içerir.

---

## 📋 Gereksinimler

- Node.js 18+ yüklü
- npm veya yarn
- Git
- Stripe hesabı (production keys)
- PayTR hesabı (opsiyonel)
- Supabase hesabı
- Vercel hesabı (önerilen) veya başka bir hosting

---

## 🎯 Adım 1: Environment Variables Kurulumu

### Otomatik Kurulum (Önerilen)

**Windows (PowerShell)**:
```powershell
cd bs3dcrafts
.\scripts\setup-production.ps1
```

**Linux/Mac (Bash)**:
```bash
cd bs3dcrafts
chmod +x scripts/setup-production.sh
./scripts/setup-production.sh
```

### Manuel Kurulum

1. `.env.example` dosyasını `.env` olarak kopyalayın:
```bash
cp .env.example .env
```

2. `.env` dosyasını düzenleyin ve aşağıdaki değerleri doldurun:

```env
# 1. ADMIN_SECRET - Güçlü random string oluştur
# PowerShell:
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Bash:
openssl rand -base64 32

# 2. Stripe Production Keys
# https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# 3. Stripe Webhook Secret
# https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# 4. PayTR Credentials (opsiyonel)
# https://www.paytr.com
PAYTR_MERCHANT_ID=...
PAYTR_MERCHANT_KEY=...
PAYTR_MERCHANT_SALT=...
PAYTR_TEST_MODE=false

# 5. Database URL
# Supabase/Railway/Neon'dan alın
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# 6. Supabase
# https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# 7. Site URL (HTTPS zorunlu!)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 🗄️ Adım 2: Database Kurulumu

### 2.1 Production Database Oluşturma

**Supabase (Önerilen)**:
1. https://supabase.com adresine gidin
2. "New Project" oluşturun
3. Database connection string'i kopyalayın
4. `.env` dosyasına ekleyin

**Alternatifler**:
- Railway: https://railway.app
- Neon: https://neon.tech
- PlanetScale: https://planetscale.com

### 2.2 Migration Çalıştırma

**Otomatik**:
```powershell
# Windows
.\scripts\deploy-database.ps1

# Linux/Mac
chmod +x scripts/deploy-database.sh
./scripts/deploy-database.sh
```

**Manuel**:
```bash
# 1. Prisma client oluştur
npm run db:generate

# 2. Migration'ları çalıştır
npm run db:migrate

# 3. Bağlantıyı test et
npx prisma db pull --force
```

### 2.3 Supabase Storage Bucket

1. Supabase Dashboard > Storage
2. "Create Bucket" tıklayın
3. Bucket adı: `products`
4. Public bucket olarak işaretleyin
5. "Create" tıklayın

---

## 🔒 Adım 3: Security Headers (Tamamlandı ✅)

Security headers `next.config.ts` dosyasına eklendi. Kontrol edin:

```typescript
// next.config.ts içinde olmalı:
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: '...' },
        { key: 'X-Frame-Options', value: 'DENY' },
        // ... diğer headerlar
      ]
    }
  ]
}
```

---

## ✅ Adım 4: Pre-Deployment Check

Deployment öncesi tüm kontrolleri yapın:

**Windows**:
```powershell
.\scripts\pre-deploy-check.ps1
```

**Linux/Mac**:
```bash
chmod +x scripts/pre-deploy-check.sh
./scripts/pre-deploy-check.sh
```

Bu script şunları kontrol eder:
- ✅ Environment variables
- ✅ Production keys
- ✅ HTTPS URL
- ✅ Build başarılı
- ✅ Testler geçiyor
- ✅ Security headers

**Tüm kontroller geçmeli!**

---

## 🚀 Adım 5: Vercel'e Deploy

### 5.1 Vercel CLI Kurulumu

```bash
npm install -g vercel
```

### 5.2 Vercel'e Login

```bash
vercel login
```

### 5.3 İlk Deploy (Test)

```bash
vercel
```

Bu komut:
- Preview URL oluşturur
- Otomatik HTTPS sağlar
- Environment variables sorar

### 5.4 Production Deploy

```bash
vercel --prod
```

### 5.5 Environment Variables Ekleme

**Vercel Dashboard'dan**:
1. Project Settings > Environment Variables
2. Tüm `.env` değişkenlerini ekleyin
3. Production environment'ı seçin
4. Save

**CLI'dan**:
```bash
vercel env add ADMIN_SECRET
vercel env add STRIPE_SECRET_KEY
# ... diğer değişkenler
```

### 5.6 Custom Domain Bağlama

1. Vercel Dashboard > Domains
2. "Add Domain" tıklayın
3. Domain'inizi girin (örn: bs3dcrafts.com)
4. DNS kayıtlarını güncelleyin
5. SSL otomatik aktif olur

---

## 🔗 Adım 6: Webhook Kurulumu

### 6.1 Stripe Webhook

1. https://dashboard.stripe.com/webhooks adresine gidin
2. "Add endpoint" tıklayın
3. Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. "Add endpoint" tıklayın
6. Webhook signing secret'i kopyalayın
7. Vercel'de `STRIPE_WEBHOOK_SECRET` olarak ekleyin

### 6.2 PayTR Webhook (Opsiyonel)

1. https://www.paytr.com paneline giriş yapın
2. Ayarlar > Bildirim Ayarları
3. Bildirim URL: `https://yourdomain.com/api/webhooks/paytr`
4. Kaydet

---

## 🧪 Adım 7: Production Test

### 7.1 HTTPS Kontrolü

```bash
curl -I https://yourdomain.com
```

Beklenen: `200 OK` ve SSL sertifikası geçerli

### 7.2 Admin Panel Testi

1. `https://yourdomain.com/admin` adresine gidin
2. Postman/curl ile test edin:

```bash
# Yetkisiz erişim (401 dönmeli)
curl -X GET https://yourdomain.com/api/admin/products

# Yetkili erişim (200 dönmeli)
curl -X GET https://yourdomain.com/api/admin/products \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

### 7.3 Gerçek Ödeme Testi

**ÖNEMLİ**: Küçük bir miktar ile test edin!

1. Siteye gidin
2. Ürün sepete ekleyin
3. Checkout'a gidin
4. Gerçek kart bilgileri girin
5. Ödemeyi tamamlayın
6. Success sayfasını kontrol edin
7. Stripe Dashboard'da ödemeyi kontrol edin
8. Database'de siparişi kontrol edin

### 7.4 Webhook Testi

1. Stripe Dashboard > Webhooks > Your endpoint
2. "Send test webhook" tıklayın
3. `checkout.session.completed` seçin
4. Send
5. Response 200 olmalı
6. Database'de sipariş oluşmalı

---

## 📊 Adım 8: Monitoring Kurulumu (Opsiyonel ama Önerilen)

### 8.1 Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### 8.2 Vercel Analytics

Vercel Dashboard'dan otomatik aktif edilir.

### 8.3 Google Analytics

```typescript
// app/layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

---

## 🎉 Deployment Tamamlandı!

### Post-Deployment Checklist

- [ ] Site HTTPS ile erişilebiliyor
- [ ] Admin panel sadece token ile erişilebiliyor
- [ ] Gerçek ödeme testi başarılı
- [ ] Webhook'lar çalışıyor
- [ ] Database bağlantısı çalışıyor
- [ ] File upload çalışıyor
- [ ] Email bildirimleri çalışıyor (varsa)
- [ ] Error monitoring aktif
- [ ] Analytics aktif
- [ ] Backup stratejisi kuruldu

---

## 🆘 Sorun Giderme

### Build Hatası

```bash
# Cache temizle
rm -rf .next node_modules
npm install
npm run build
```

### Database Bağlantı Hatası

```bash
# Connection string'i kontrol et
npx prisma db pull

# Migration'ları tekrar çalıştır
npm run db:migrate
```

### Webhook Çalışmıyor

1. Webhook URL'i kontrol et (HTTPS olmalı)
2. Webhook secret'i kontrol et
3. Vercel logs'u kontrol et: `vercel logs`
4. Stripe Dashboard'da webhook logs'u kontrol et

### Environment Variables Yüklenmiyor

1. Vercel Dashboard > Settings > Environment Variables
2. Tüm değişkenlerin Production environment'ında olduğunu kontrol et
3. Redeploy: `vercel --prod --force`

---

## 📞 Destek

- Dokümantasyon: Bu klasördeki tüm .md dosyaları
- Stripe Destek: https://support.stripe.com
- Vercel Destek: https://vercel.com/support
- Supabase Destek: https://supabase.com/support

---

## 🔄 Güncelleme ve Bakım

### Kod Güncellemesi

```bash
# 1. Değişiklikleri yap
git add .
git commit -m "Update: ..."
git push

# 2. Vercel otomatik deploy eder
# veya manuel:
vercel --prod
```

### Database Migration

```bash
# 1. Yeni migration oluştur
npx prisma migrate dev --name migration_name

# 2. Production'a uygula
npm run db:migrate
```

### Dependency Güncellemesi

```bash
# Security audit
npm audit

# Güvenlik güncellemeleri
npm audit fix

# Tüm dependencies
npm update
```

---

**Tebrikler! 🎉 Siteniz artık production'da!**

Düzenli olarak:
- Security audit yapın
- Backup'ları kontrol edin
- Performance'ı izleyin
- User feedback'i toplayın
