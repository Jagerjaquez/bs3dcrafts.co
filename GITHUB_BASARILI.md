# ✅ GitHub'a Yükleme Başarılı!

**Repository**: https://github.com/Jagerjaquez/bs3dcrafts.co

## 📊 Yüklenen İçerik

- 190 dosya
- 47,512 satır kod
- 10.95 MB

## 🎯 Sonraki Adımlar

### 1. Vercel'e Bağlayın

1. https://vercel.com adresine gidin
2. "Add New..." > "Project"
3. "Import Git Repository" seçin
4. GitHub'dan `Jagerjaquez/bs3dcrafts.co` seçin
5. "Import" tıklayın

### 2. Environment Variables Ekleyin

Vercel'de Settings > Environment Variables:

```env
# Database
DATABASE_URL=postgresql://postgres.jiutbqwwjkzjwzhxmgnw:414235BrknSld@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.jiutbqwwjkzjwzhxmgnw:414235BrknSld@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TG8jtKIgm4H4bAovfoGtkxR3t0Hz0PA30NEWDqwIqCDSrSBvX6yJ6Wr6isa16qKz992HzuFGMESqx5i4G341hFY00eL9eeaXr
STRIPE_SECRET_KEY=[Vercel'den alın]
STRIPE_WEBHOOK_SECRET=whsec_fMsPSUgn1O1sYDZc7rk7qmlwpzP6asqr

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jiutbqwwjkzjwzhxmgnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdXRicXd3amt6and6aHhtZ253Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Mzc1OTcsImV4cCI6MjA5MDMxMzU5N30.fbrI3u8yx5VmscYWf1lugDY65UAjb8PzhzsXgU6_Duw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdXRicXd3amt6and6aHhtZ253Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDczNzU5NywiZXhwIjoyMDkwMzEzNTk3fQ.TkgXsHGMOxEZUtMc-NaB5-WxofJdwavDO2XTO5H6Mgc

# Admin
ADMIN_SECRET=AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=

# User Auth (YENİ - MUTLAKA EKLE)
JWT_SECRET=Xk9mP2vL8nQ4wR7tY6uI3oP5aS1dF0gH9jK2lZ4xC8vB6nM3qW5eR7tY9uI1oP3a

# Site URLs (YENİ - MUTLAKA EKLE)
NEXT_PUBLIC_BASE_URL=https://bs3dcrafts.vercel.app
NEXT_PUBLIC_SITE_URL=https://bs3dcrafts.vercel.app
NEXT_PUBLIC_APP_URL=https://bs3dcrafts.vercel.app
```

### 3. Deploy & Test

Deploy tamamlandıktan sonra:
- https://bs3dcrafts.vercel.app/register
- https://bs3dcrafts.vercel.app/login
- https://bs3dcrafts.vercel.app/account

## 🔄 Gelecek Güncellemeler

Kod değişikliği yaptığınızda:

```bash
cd "C:\Users\berki\Desktop\3D YAZICI E TİCARET SİTESİ\bs3dcrafts"
git add .
git commit -m "feat: yeni özellik açıklaması"
git push origin main
```

Vercel otomatik deploy edecek!

## 📝 Notlar

- Hassas bilgiler içeren 5 dosya GitHub'a yüklenmedi (güvenlik)
- .env dosyası .gitignore'da (yüklenmedi)
- Tüm API key'ler Vercel'de environment variables olarak eklenecek

## 🎉 Tebrikler!

Projeniz artık GitHub'da ve Vercel'e deploy edilmeye hazır!
