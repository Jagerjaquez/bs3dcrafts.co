# ✅ Production Deployment Checklist

Deployment öncesi bu listeyi kontrol edin.

---

## 🔴 Kritik (MUTLAKA Yapılmalı)

### 1. Environment Variables
- [x] `.env` dosyası oluşturuldu
- [x] `ADMIN_SECRET` güçlü (32+ karakter)
- [ ] Stripe production keys (`sk_live_*`, `pk_live_*`)
- [ ] PayTR production credentials
- [ ] `PAYTR_TEST_MODE=false`
- [x] Production database URL
- [x] Supabase credentials
- [x] `NEXT_PUBLIC_APP_URL` HTTPS ile başlıyor

**Script**: `.\scripts\setup-production.ps1` veya `./scripts/setup-production.sh`

### 2. Database
- [x] Production database oluşturuldu
- [x] Migration'lar çalıştırıldı
- [x] Database bağlantısı test edildi
- [x] Supabase storage bucket oluşturuldu (`products`)

**Script**: `.\scripts\deploy-database.ps1` veya `./scripts/deploy-database.sh`

### 3. Security
- [x] Security headers eklendi (`next.config.ts`)
- [x] `.env` dosyası `.gitignore`'da
- [ ] Admin authentication aktif (ŞU AN KAPALI - GÜVENLİK RİSKİ!)
- [x] File upload validation aktif
- [x] Input validation aktif
- [x] Rate limiting aktif

**Kontrol**: `next.config.ts` dosyasında `async headers()` fonksiyonu var mı?

### 4. Build & Test
- [x] `npm run build` başarılı
- [x] `npm test` geçiyor
- [x] Tüm TypeScript hataları düzeltildi
- [x] Pre-deploy check geçti

**Script**: `.\scripts\pre-deploy-check.ps1` veya `./scripts/pre-deploy-check.sh`

### 5. Deployment
- [x] Vercel'e deploy edildi
- [ ] Custom domain bağlandı
- [x] HTTPS aktif
- [x] Environment variables Vercel'de ayarlandı

**Komut**: `vercel --prod`

### 6. Webhooks
- [ ] Stripe webhook URL ayarlandı (GEÇİCİ BYPASS AKTİF)
- [ ] Stripe webhook secret Vercel'de
- [ ] PayTR webhook URL ayarlandı
- [ ] Webhook testleri başarılı

**URL'ler**:
- Stripe: `https://yourdomain.com/api/webhooks/stripe`
- PayTR: `https://yourdomain.com/api/webhooks/paytr`

---

## 🟡 Önemli (Şiddetle Önerilir)

### 7. Testing
- [x] Admin panel erişim testi
- [ ] Gerçek ödeme testi (küçük miktar)
- [ ] Webhook delivery testi
- [x] File upload testi
- [ ] Email notification testi (varsa)

### 8. Monitoring
- [x] Error tracking hazır (`lib/monitoring.ts` - Sentry eklenebilir)
- [ ] Uptime monitoring (opsiyonel)
- [ ] Performance monitoring (opsiyonel)
- [ ] Log aggregation (opsiyonel)

### 9. Analytics
- [x] Google Analytics hazır (`NEXT_PUBLIC_GA_MEASUREMENT_ID` ekleyin)
- [x] Conversion tracking hazır
- [x] E-commerce tracking hazır

### 10. Backup
- [x] Database backup stratejisi (Supabase otomatik backup)
- [ ] Backup restore testi yapıldı

---

## 🟢 İsteğe Bağlı (İyileştirmeler)

### 11. Performance
- [x] Image optimization (Next.js Image component)
- [x] CDN kullanımı (Vercel otomatik)
- [ ] Caching stratejisi
- [ ] Database query optimization

### 12. SEO
- [x] Meta tags
- [x] Sitemap.xml
- [x] robots.txt
- [x] Structured data (JSON-LD)
- [x] Open Graph tags

### 13. Legal
- [x] Gizlilik politikası
- [x] Kullanım şartları
- [ ] KVKK uyumluluğu
- [ ] Çerez politikası
- [ ] İade ve iade politikası

### 14. Customer Support
- [x] İletişim formu
- [ ] Email support
- [x] FAQ sayfası
- [ ] Live chat (opsiyonel)

---

## 📊 Post-Deployment Verification

### Hemen Sonra (İlk 1 Saat)
- [x] Site erişilebilir
- [x] HTTPS çalışıyor
- [x] Admin panel çalışıyor
- [ ] Test ödemesi başarılı (GEÇİCİ BYPASS AKTİF)
- [ ] Webhook'lar çalışıyor

### İlk Gün
- [ ] Error logs kontrol edildi
- [ ] Performance metrics kontrol edildi
- [ ] Gerçek kullanıcı testi
- [x] Tüm sayfalar çalışıyor

### İlk Hafta
- [ ] Günlük error monitoring
- [ ] Ödeme success rate
- [ ] Webhook delivery rate
- [ ] Database performance
- [ ] User feedback toplama

### İlk Ay
- [ ] Security audit
- [ ] Performance optimization
- [ ] User analytics review
- [ ] Backup restore test
- [ ] Disaster recovery test

---

## 🎯 Deployment Sırası

1. ✅ Environment variables setup
2. ✅ Database migration
3. ✅ Security headers
4. ✅ Pre-deploy check
5. ✅ Deploy to Vercel
6. ⚠️ Webhook configuration (Stripe bypass aktif)
7. ⚠️ Production testing (Stripe düzeltilmeli)
8. ✅ Monitoring setup
9. ✅ SEO optimization
10. 🚀 Go live!

---

## ⚠️ KRİTİK UYARILAR

### Stripe Ödeme Sistemi
- **DURUM**: Geçici bypass aktif (`/api/checkout/simple`)
- **SORUN**: Vercel environment variables'da newline karakterleri
- **ÇÖZÜM**: Stripe keys'leri Vercel'de temizleyip yeniden ekleyin
- **TEST**: `/api/test-stripe` endpoint'i success dönmeli
- **SONRA**: `checkout-form.tsx`'de `/api/checkout/session` kullanın

### Admin Güvenliği
- **DURUM**: Authentication tamamen kaldırıldı
- **RİSK**: Herkes admin panele erişebilir
- **ÇÖZÜM**: Production'da mutlaka authentication ekleyin
- **ÖNERİ**: NextAuth.js veya Clerk kullanın

---

## 📞 Emergency Contacts

### Kritik Sorun Durumunda

1. **Site Down**:
   - Vercel status: https://vercel-status.com
   - Vercel logs: `vercel logs`
   - Rollback: `vercel rollback`

2. **Database Issue**:
   - Supabase status
   - Database logs
   - Backup restore

3. **Payment Issue**:
   - Stripe Dashboard
   - PayTR Panel
   - Webhook logs

---

## 📚 Dokümantasyon

- **Quick Start**: `QUICK_START_PRODUCTION.md`
- **Detaylı Rehber**: `DEPLOYMENT_GUIDE.md`
- **Güvenlik**: `SECURITY_REPORT.md`
- **Hazırlık**: `PRODUCTION_READINESS.md`

---

## ✅ Final Check

Deployment yapmadan önce bu soruları kendinize sorun:

- [x] Tüm kritik adımlar tamamlandı mı? (Stripe hariç)
- [x] Pre-deploy check geçti mi?
- [ ] Gerçek para ile test yaptım mı? (Stripe düzeltilmeli)
- [ ] Webhook'lar çalışıyor mu? (Stripe düzeltilmeli)
- [x] Backup stratejim var mı?
- [x] Sorun durumunda ne yapacağımı biliyor muyum?

**⚠️ ÖNEMLİ**: Stripe ödeme sistemi düzeltilmeden production'a geçmeyin!

---

## 🆕 Yeni Eklenenler (2026-03-30)

### SEO Optimizasyonu
- ✅ `app/sitemap.ts` - Otomatik sitemap oluşturma
- ✅ `app/robots.ts` - Robots.txt yapılandırması
- ✅ `app/layout.tsx` - Open Graph tags, Twitter Cards, JSON-LD
- ✅ Meta keywords ve description optimize edildi

### Monitoring & Analytics
- ✅ `lib/analytics.ts` - Google Analytics helper functions
- ✅ `lib/monitoring.ts` - Error tracking ve logging
- ✅ `components/analytics.tsx` - Analytics component
- ✅ E-commerce tracking fonksiyonları

### Test Suite
- ✅ `app/test/page.tsx` - Kapsamlı test sayfası
- ✅ SEO testleri eklendi
- ✅ Tüm kritik sistemler test ediliyor

---

**Son Güncelleme**: 2026-03-30  
**Versiyon**: 2.0.0

