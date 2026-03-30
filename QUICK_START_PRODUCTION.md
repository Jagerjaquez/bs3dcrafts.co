# ⚡ Quick Start - Production Deployment

Bu dosya, production'a çıkmak için gereken minimum adımları içerir.

---

## 🚀 5 Dakikada Production'a Çık

### 1️⃣ Environment Variables (2 dakika)

**Windows**:
```powershell
cd bs3dcrafts
.\scripts\setup-production.ps1
```

**Linux/Mac**:
```bash
cd bs3dcrafts
chmod +x scripts/*.sh
./scripts/setup-production.sh
```

Script size soracak:
- Stripe production keys
- PayTR credentials
- Database URL
- Supabase credentials
- Site URL (HTTPS)

### 2️⃣ Database Setup (1 dakika)

**Windows**:
```powershell
.\scripts\deploy-database.ps1
```

**Linux/Mac**:
```bash
./scripts/deploy-database.sh
```

### 3️⃣ Pre-Deploy Check (1 dakika)

**Windows**:
```powershell
.\scripts\pre-deploy-check.ps1
```

**Linux/Mac**:
```bash
./scripts/pre-deploy-check.sh
```

Tüm kontroller ✅ olmalı!

### 4️⃣ Deploy to Vercel (1 dakika)

```bash
# Vercel CLI kur (ilk kez)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5️⃣ Webhook Setup (30 saniye)

**Stripe**:
1. https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. Copy webhook secret → Vercel env variables

**PayTR**:
1. https://www.paytr.com panel
2. Ayarlar > Bildirim: `https://yourdomain.com/api/webhooks/paytr`

---

## ✅ Tamamlandı!

Site artık production'da: `https://yourdomain.com`

### Test Et:
1. Admin panel: `https://yourdomain.com/admin`
2. Gerçek ödeme yap (küçük miktar)
3. Webhook'ları kontrol et

---

## 📚 Detaylı Dokümantasyon

- **Tam Rehber**: `DEPLOYMENT_GUIDE.md`
- **Güvenlik**: `SECURITY_REPORT.md`
- **PayTR**: `PAYTR_SETUP.md`
- **Supabase**: `SUPABASE_SETUP.md`

---

## 🆘 Sorun mu Var?

1. `DEPLOYMENT_GUIDE.md` > Sorun Giderme bölümü
2. Script loglarını kontrol et
3. Vercel logs: `vercel logs`

---

## 🎯 Sonraki Adımlar

- [ ] Monitoring kur (Sentry)
- [ ] Analytics ekle (Google Analytics)
- [ ] Email notifications
- [ ] Backup stratejisi
- [ ] SEO optimization

Detaylar için: `PRODUCTION_READINESS.md`
