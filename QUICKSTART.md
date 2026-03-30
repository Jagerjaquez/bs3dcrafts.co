# ⚡ Hızlı Başlangıç Rehberi

BS3DCRAFTS.CO'yu 5 dakikada çalıştırın!

## 🎯 Minimum Gereksinimler

- Node.js 18+ 
- PostgreSQL (veya Supabase hesabı)
- Stripe hesabı (test mode)
- Supabase hesabı

## 🚀 Hızlı Kurulum

### 1. Projeyi Klonla
\`\`\`bash
cd bs3dcrafts
npm install
\`\`\`

### 2. Environment Variables
\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\` dosyasını düzenle:
\`\`\`env
# Minimum gerekli değişkenler
DATABASE_URL="postgresql://user:password@localhost:5432/bs3dcrafts"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="xxx"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
\`\`\`

### 3. Database Setup
\`\`\`bash
# Migration çalıştır
npx prisma migrate dev --name init

# Örnek ürünler ekle
npx tsx prisma/seed.ts
\`\`\`

### 4. Stripe Webhook (Development)
Yeni terminal aç:
\`\`\`bash
stripe listen --forward-to localhost:3000/api/webhook
\`\`\`

Webhook secret'ı kopyala ve .env'e ekle.

### 5. Supabase Storage
1. Supabase Dashboard > Storage
2. "products" bucket oluştur
3. Public olarak işaretle

### 6. Başlat!
\`\`\`bash
npm run dev
\`\`\`

🎉 Site hazır: http://localhost:3000

## 📍 Önemli URL'ler

- Ana Sayfa: http://localhost:3000
- Ürünler: http://localhost:3000/products
- Admin Panel: http://localhost:3000/admin
- Sepet: http://localhost:3000/cart

## 🧪 Test Ödeme

Stripe test kartları:
- Kart: 4242 4242 4242 4242
- Tarih: Gelecek herhangi bir tarih
- CVC: Herhangi 3 rakam
- ZIP: Herhangi 5 rakam

## 🛠️ Yararlı Komutlar

\`\`\`bash
# Development
npm run dev

# Database
npm run db:studio      # Prisma Studio aç
npm run db:migrate     # Migration çalıştır
npm run db:generate    # Prisma client oluştur

# Build
npm run build
npm start
\`\`\`

## 🐛 Sorun Giderme

### Port zaten kullanımda
\`\`\`bash
# Farklı port kullan
npm run dev -- -p 3001
\`\`\`

### Database bağlantı hatası
- PostgreSQL çalışıyor mu kontrol et
- DATABASE_URL doğru mu kontrol et

### Stripe webhook çalışmıyor
- Stripe CLI kurulu mu?
- Webhook secret .env'de mi?

## 📚 Daha Fazla Bilgi

- [README.md](./README.md) - Detaylı dokümantasyon
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Docs](https://stripe.com/docs)

## 💡 İpuçları

1. Prisma Studio ile database'i görselleştir:
   \`\`\`bash
   npm run db:studio
   \`\`\`

2. Seed script ile test ürünleri ekle:
   \`\`\`bash
   npx tsx prisma/seed.ts
   \`\`\`

3. Admin panel için şifre .env'de:
   \`\`\`env
   ADMIN_SECRET=your-password
   \`\`\`

---

Hazırsınız! 🚀 Kolay gelsin!
