# 🚀 Launch Roadmap - Siteyi Yayınlama Adımları

Bu dokümanda sitenizi insanlara sunmak için yapmanız gereken tüm adımlar sırayla listelenmiştir.

---

## 📅 Tahmini Süre: 2-3 Gün

---

## 🔴 GÜN 1: Hazırlık ve Konfigürasyon (4-6 saat)

### ✅ Adım 1: Stripe Production Hesabı (30 dakika)

**Yapılacaklar**:
1. https://dashboard.stripe.com adresine gidin
2. Test mode'dan Live mode'a geçin (sağ üst köşe)
3. "Get your API keys" tıklayın
4. Production key'leri kopyalayın:
   - Secret key (sk_live_...)
   - Publishable key (pk_live_...)

**Not**: Stripe hesabınızın aktif olması gerekir. İlk ödemeden sonra hesap doğrulaması isteyebilir.

---

### ✅ Adım 2: PayTR Production Hesabı (30 dakika) [OPSIYONEL]

**Yapılacaklar**:
1. https://www.paytr.com adresine gidin
2. Üye olun / Giriş yapın
3. Merchant başvurusu yapın
4. Onay bekleyin (1-2 gün sürebilir)
5. Onaylandıktan sonra:
   - Merchant ID
   - Merchant Key
   - Merchant Salt
   değerlerini alın

**Not**: PayTR onayı beklerken Stripe ile devam edebilirsiniz.

---

### ✅ Adım 3: Supabase Production Database (30 dakika)

**Yapılacaklar**:
1. https://supabase.com adresine gidin
2. "New Project" oluşturun
3. Proje adı: `bs3dcrafts-production`
4. Database password oluşturun (güçlü!)
5. Region seçin (en yakın: Europe West)
6. "Create Project" tıklayın (2-3 dakika sürer)

**Database Connection String Alma**:
1. Project Settings > Database
2. Connection string > URI (with connection pooling)
3. `[YOUR-PASSWORD]` yerine şifrenizi yazın
4. Kopyalayın: `DATABASE_URL`
5. Connection string > URI (Session mode)
6. Kopyalayın: `DIRECT_URL`

**Storage Bucket Oluşturma**:
1. Storage > Create Bucket
2. Name: `products`
3. Public bucket: ✅
4. Create

---

### ✅ Adım 4: Domain Satın Alma (15 dakika)

**Önerilen Domain Sağlayıcıları**:
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- Google Domains: https://domains.google

**Domain Önerileri**:
- bs3dcrafts.com
- bs3dprinting.com
- 3dcraftsturkey.com

**Fiyat**: ~$10-15/yıl

**Not**: Domain'i aldıktan sonra DNS ayarlarını henüz değiştirmeyin, Vercel'den sonra yapacağız.

---

### ✅ Adım 5: Environment Variables Ayarlama (15 dakika)

**PowerShell'de çalıştırın**:
```powershell
cd bs3dcrafts
.\scripts\setup-production.ps1
```

**Script size soracak**:
1. Stripe Secret Key → `sk_live_...`
2. Stripe Publishable Key → `pk_live_...`
3. Stripe Webhook Secret → (şimdilik boş bırakın, sonra ekleyeceğiz)
4. PayTR Merchant ID → (varsa girin, yoksa boş)
5. PayTR Merchant Key → (varsa girin, yoksa boş)
6. PayTR Merchant Salt → (varsa girin, yoksa boş)
7. PayTR Test Mode → `false`
8. Database URL → Supabase'den aldığınız
9. Direct URL → Supabase'den aldığınız
10. Supabase URL → `https://xxx.supabase.co`
11. Supabase Anon Key → Supabase'den
12. Supabase Service Role Key → Supabase'den
13. Site URL → `https://yourdomain.com` (aldığınız domain)

**Oluşturulan**: `.env` dosyası

---

### ✅ Adım 6: Database Migration (10 dakika)

**PowerShell'de çalıştırın**:
```powershell
.\scripts\deploy-database.ps1
```

Bu script:
- Prisma client oluşturur
- Migration'ları çalıştırır
- Database bağlantısını test eder

**Beklenen Sonuç**: ✅ Database deployment complete!

---

### ✅ Adım 7: Pre-Deploy Check (5 dakika)

**PowerShell'de çalıştırın**:
```powershell
.\scripts\pre-deploy-check.ps1
```

**Tüm kontroller ✅ olmalı!**

Eğer ❌ varsa:
- Hata mesajını okuyun
- Düzeltin
- Tekrar çalıştırın

---

### ✅ Adım 8: Vercel Hesabı ve CLI Kurulumu (10 dakika)

**Vercel Hesabı**:
1. https://vercel.com adresine gidin
2. "Sign Up" tıklayın
3. GitHub ile giriş yapın (önerilir)

**Vercel CLI Kurulumu**:
```powershell
npm install -g vercel
```

**Login**:
```powershell
vercel login
```

Email'inize gelen linke tıklayın.

---

## 🟡 GÜN 2: Deployment ve Konfigürasyon (3-4 saat)

### ✅ Adım 9: İlk Deployment (Test) (10 dakika)

**PowerShell'de çalıştırın**:
```powershell
vercel
```

**Sorular**:
- Set up and deploy? → `Y`
- Which scope? → Kendi hesabınızı seçin
- Link to existing project? → `N`
- Project name? → `bs3dcrafts`
- Directory? → `./` (Enter)
- Override settings? → `N`

**Sonuç**: Preview URL alacaksınız (örn: `bs3dcrafts-xxx.vercel.app`)

**Test edin**: Preview URL'i tarayıcıda açın

---

### ✅ Adım 10: Environment Variables Vercel'e Ekleme (15 dakika)

**Yöntem 1: Vercel Dashboard (Önerilen)**:
1. https://vercel.com/dashboard
2. Projenizi seçin
3. Settings > Environment Variables
4. `.env` dosyanızdaki TÜM değişkenleri ekleyin:
   - Variable name: `ADMIN_SECRET`
   - Value: `.env`'deki değer
   - Environment: `Production` ✅
   - Add
5. Tüm değişkenler için tekrarlayın

**Yöntem 2: CLI**:
```powershell
vercel env add ADMIN_SECRET production
# Her değişken için tekrarlayın
```

**Eklenmesi Gerekenler**:
- ADMIN_SECRET
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET (sonra ekleyeceğiz)
- PAYTR_MERCHANT_ID
- PAYTR_MERCHANT_KEY
- PAYTR_MERCHANT_SALT
- PAYTR_TEST_MODE
- DATABASE_URL
- DIRECT_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

---

### ✅ Adım 11: Production Deployment (5 dakika)

**PowerShell'de çalıştırın**:
```powershell
vercel --prod
```

**Sonuç**: Production URL alacaksınız (örn: `bs3dcrafts.vercel.app`)

**Test edin**: Production URL'i tarayıcıda açın

---

### ✅ Adım 12: Custom Domain Bağlama (15 dakika)

**Vercel Dashboard'da**:
1. Project > Settings > Domains
2. "Add Domain" tıklayın
3. Domain'inizi girin: `bs3dcrafts.com`
4. Add

**DNS Ayarları**:
Vercel size DNS kayıtları gösterecek:

**A Record**:
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**CNAME Record** (www için):
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Domain sağlayıcınızda (Namecheap/GoDaddy)**:
1. DNS Management'a gidin
2. Yukarıdaki kayıtları ekleyin
3. Save

**Bekleme**: DNS propagation 5-30 dakika sürer

**Test**: `https://bs3dcrafts.com` adresine gidin

---

### ✅ Adım 13: Stripe Webhook Kurulumu (10 dakika)

**Stripe Dashboard**:
1. https://dashboard.stripe.com/webhooks
2. "Add endpoint" tıklayın
3. Endpoint URL: `https://bs3dcrafts.com/api/webhooks/stripe`
4. Description: `Production Webhook`
5. Events to send:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
6. "Add endpoint" tıklayın
7. Webhook signing secret'i kopyalayın (whsec_...)

**Vercel'e Ekleyin**:
1. Vercel Dashboard > Settings > Environment Variables
2. Add: `STRIPE_WEBHOOK_SECRET` = `whsec_...`
3. Environment: Production
4. Save

**Redeploy**:
```powershell
vercel --prod --force
```

---

### ✅ Adım 14: PayTR Webhook Kurulumu (5 dakika) [OPSIYONEL]

**PayTR Panel**:
1. https://www.paytr.com paneline giriş yapın
2. Ayarlar > Bildirim Ayarları
3. Bildirim URL: `https://bs3dcrafts.com/api/webhooks/paytr`
4. Kaydet

---

## 🟢 GÜN 3: Test ve Launch (2-3 saat)

### ✅ Adım 15: Admin Panel Testi (10 dakika)

**Test 1: Yetkisiz Erişim**:
```powershell
curl -X GET https://bs3dcrafts.com/api/admin/products
```
**Beklenen**: 401 Unauthorized

**Test 2: Yetkili Erişim**:
```powershell
$adminSecret = "YOUR_ADMIN_SECRET"
curl -X GET https://bs3dcrafts.com/api/admin/products `
  -H "Authorization: Bearer $adminSecret"
```
**Beklenen**: 200 OK

**Test 3: Browser'da**:
1. `https://bs3dcrafts.com/admin` adresine gidin
2. Ürün eklemeyi deneyin
3. Resim yüklemeyi deneyin

---

### ✅ Adım 16: İlk Ürünleri Ekleme (30 dakika)

**Admin Panel'den**:
1. `https://bs3dcrafts.com/admin/products/new`
2. En az 3-5 ürün ekleyin:
   - Ürün adı
   - Açıklama
   - Fiyat
   - Stok
   - Resimler
   - Kategori
   - Materyal

**Örnek Ürünler**:
- 3D Baskı Vazo
- Özel Tasarım Biblo
- Dekoratif Duvar Süsü
- Telefon Standı
- Kalemlik

---

### ✅ Adım 17: Gerçek Ödeme Testi (15 dakika)

**ÖNEMLİ**: Küçük bir miktar ile test edin!

**Test Senaryosu**:
1. `https://bs3dcrafts.com` adresine gidin
2. Bir ürün seçin (en ucuz olanı)
3. Sepete ekle
4. Checkout'a git
5. Müşteri bilgilerini doldurun
6. Ödeme yöntemi seç (Stripe veya PayTR)
7. **Gerçek kart bilgilerinizi girin**
8. Ödemeyi tamamla

**Kontroller**:
- ✅ Success sayfası göründü mü?
- ✅ Stripe Dashboard'da ödeme görünüyor mu?
- ✅ Database'de sipariş oluştu mu?
- ✅ Email bildirimi geldi mi? (varsa)

**Supabase'de Kontrol**:
1. Supabase Dashboard > Table Editor
2. `Order` tablosunu aç
3. Siparişi gör

---

### ✅ Adım 18: Webhook Testi (10 dakika)

**Stripe Webhook Test**:
1. Stripe Dashboard > Webhooks
2. Endpoint'inizi seçin
3. "Send test webhook" tıklayın
4. Event: `checkout.session.completed`
5. Send

**Kontrol**:
- Response: 200 OK
- Vercel Logs: `vercel logs`

**PayTR Webhook Test**:
1. Gerçek ödeme yapın (zaten yaptınız)
2. PayTR panel > İşlemler
3. Webhook durumunu kontrol edin

---

### ✅ Adım 19: Performance ve Security Check (15 dakika)

**Google PageSpeed Insights**:
1. https://pagespeed.web.dev
2. URL: `https://bs3dcrafts.com`
3. Analyze

**Hedef**: 80+ skor

**SSL Test**:
1. https://www.ssllabs.com/ssltest/
2. URL: `bs3dcrafts.com`
3. Test

**Hedef**: A veya A+ rating

**Security Headers**:
1. https://securityheaders.com
2. URL: `https://bs3dcrafts.com`
3. Scan

**Hedef**: A veya A+ rating

---

### ✅ Adım 20: Monitoring Kurulumu (30 dakika) [OPSIYONEL AMA ÖNERİLİR]

**Sentry (Error Tracking)**:
```powershell
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

**Vercel Analytics**:
- Otomatik aktif (Vercel Dashboard'da görünür)

**Google Analytics**:
1. https://analytics.google.com
2. Yeni property oluştur
3. Tracking ID'yi al
4. `app/layout.tsx`'e ekle

---

### ✅ Adım 21: Backup Stratejisi (15 dakika)

**Supabase Backup**:
1. Supabase Dashboard > Database > Backups
2. "Enable Point in Time Recovery" (Pro plan gerekir)
3. Veya manuel backup:
   ```powershell
   pg_dump $DATABASE_URL > backup.sql
   ```

**Otomatik Backup Script**:
- Haftada bir çalışacak şekilde ayarlayın
- Backup'ları güvenli bir yere kaydedin (Google Drive, Dropbox)

---

### ✅ Adım 22: Legal Sayfalar (1 saat) [ÖNEMLİ]

**Oluşturulması Gerekenler**:
1. **Gizlilik Politikası** (`/privacy`)
   - Hangi verileri topladığınız
   - Nasıl kullandığınız
   - KVKK uyumluluğu

2. **Kullanım Şartları** (`/terms`)
   - Satış koşulları
   - İade politikası
   - Sorumluluk reddi

3. **İletişim** (`/contact`)
   - Email
   - Telefon
   - Adres

4. **Hakkımızda** (`/about`)
   - Şirket hikayesi
   - Misyon
   - Vizyon

**Şablonlar**: https://www.termsfeed.com (ücretsiz generator)

---

### ✅ Adım 23: SEO Optimizasyonu (30 dakika)

**Meta Tags** (`app/layout.tsx`):
```typescript
export const metadata = {
  title: 'BS3DCRAFTS - Premium 3D Baskı Ürünleri',
  description: 'Özel tasarım 3D baskı ürünleri...',
  keywords: '3d baskı, 3d printing, özel tasarım...',
}
```

**Sitemap Oluşturma**:
```powershell
# app/sitemap.ts oluştur
```

**robots.txt**:
```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://bs3dcrafts.com/sitemap.xml
```

---

### ✅ Adım 24: Social Media Hazırlığı (30 dakika)

**Oluşturulacak Hesaplar**:
- Instagram: @bs3dcrafts
- Facebook: BS3DCRAFTS
- Twitter/X: @bs3dcrafts

**İlk Paylaşımlar**:
- Launch announcement
- Ürün fotoğrafları
- Behind the scenes

---

### ✅ Adım 25: Soft Launch (1 saat)

**Hedef Kitle**:
- Arkadaşlar
- Aile
- Beta testerlar

**Yapılacaklar**:
1. 5-10 kişiye link gönderin
2. Feedback toplayın
3. Sorunları düzeltin
4. Tekrar test edin

---

### ✅ Adım 26: LAUNCH! 🚀

**Duyuru Kanalları**:
1. Social media'da paylaş
2. Email listesine gönder (varsa)
3. Forumlar/Reddit'te paylaş
4. Google My Business oluştur
5. Yerel dizinlere ekle

**Launch Checklist**:
- [ ] Site erişilebilir
- [ ] Ödeme çalışıyor
- [ ] Admin panel çalışıyor
- [ ] Webhook'lar çalışıyor
- [ ] Monitoring aktif
- [ ] Backup stratejisi var
- [ ] Legal sayfalar hazır
- [ ] Social media hesapları açık

---

## 📊 Launch Sonrası (İlk Hafta)

### Günlük Yapılacaklar:
- [ ] Error logs kontrol et
- [ ] Ödeme success rate kontrol et
- [ ] Customer feedback oku
- [ ] Performance metrics kontrol et
- [ ] Social media'ya cevap ver

### Haftalık Yapılacaklar:
- [ ] Analytics review
- [ ] Conversion rate analizi
- [ ] A/B testing başlat
- [ ] Marketing stratejisi optimize et

---

## 💰 Maliyet Özeti

### İlk Ay:
- Domain: $10-15/yıl
- Vercel: $0 (Hobby) veya $20/ay (Pro)
- Supabase: $0 (Free) veya $25/ay (Pro)
- Stripe: %2.9 + $0.30 per transaction
- PayTR: ~%2.5-3 per transaction

**Toplam**: $0-50/ay (transaction fee'ler hariç)

---

## 🎯 Başarı Metrikleri

### İlk Hafta Hedefleri:
- 10+ ziyaretçi
- 1+ gerçek sipariş
- 0 kritik hata
- 100% uptime

### İlk Ay Hedefleri:
- 100+ ziyaretçi
- 10+ sipariş
- 5+ müşteri
- Pozitif feedback

---

## 📞 Destek

**Acil Durum**:
- Vercel Status: https://vercel-status.com
- Stripe Status: https://status.stripe.com
- Supabase Status: https://status.supabase.com

**Dokümantasyon**:
- `DEPLOYMENT_GUIDE.md`
- `SECURITY_REPORT.md`
- `QUICK_START_PRODUCTION.md`

---

## ✅ Final Checklist

Launch yapmadan önce:

- [ ] Tüm adımlar tamamlandı
- [ ] Gerçek ödeme testi başarılı
- [ ] Webhook'lar çalışıyor
- [ ] Legal sayfalar hazır
- [ ] Monitoring aktif
- [ ] Backup stratejisi var
- [ ] Acil durum planı hazır

**Hepsi ✅ ise → LAUNCH! 🚀🎉**

---

**Başarılar dilerim! 🚀**

Sorularınız olursa yardımcı olmaya hazırım.
