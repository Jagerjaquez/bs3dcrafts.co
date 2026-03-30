# BS3DCRAFTS.CO - Premium 3D Baskı E-Ticaret Platformu

Modern, profesyonel ve güven veren 3D baskı ürünleri satış platformu.

## 🚀 Özellikler

### Müşteri Tarafı
- ✨ Modern ve premium dark mode tasarım
- 🛍️ Ürün listeleme ve detay sayfaları
- 🛒 Sepet yönetimi (Zustand ile state management)
- 💳 Çoklu ödeme desteği (Stripe + PayTR)
- 📱 Responsive tasarım
- 🎨 Framer Motion animasyonlar
- 🔍 Ürün filtreleme ve arama (gelecek)

### Admin Paneli
- 📊 Dashboard (toplam sipariş, ciro, stok uyarıları)
- 📦 Ürün yönetimi (ekleme, düzenleme, stok takibi)
- 🛍️ Sipariş yönetimi ve durum takibi
- 📸 Görsel ve 3D model yükleme (Supabase Storage)

### Teknik Özellikler
- ⚡ Next.js 15 (App Router)
- 🎯 TypeScript
- 🎨 Tailwind CSS + Shadcn UI
- 🗄️ PostgreSQL + Prisma ORM
- 💾 Supabase Storage
- 💳 Stripe + PayTR ödeme entegrasyonu
- 🎭 Framer Motion
- 🧊 Three.js (3D preview için hazır)

## 📋 Kurulum

### 1. Bağımlılıkları Yükle
\`\`\`bash
npm install
\`\`\`

### 2. Veritabanı Kurulumu

PostgreSQL veritabanı oluşturun:
\`\`\`bash
# Yerel PostgreSQL
createdb bs3dcrafts

# Veya Supabase/Railway/Neon gibi cloud servis kullanın
\`\`\`

### 3. Environment Variables

\`.env\` dosyası oluşturun:
\`\`\`bash
cp .env.example .env
\`\`\`

Gerekli değişkenleri doldurun:
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/bs3dcrafts"

# Stripe (https://stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PayTR (https://www.paytr.com) - Türk müşteriler için
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_TEST_MODE=true

# Supabase (https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Admin
ADMIN_SECRET=your-secure-password

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4. PayTR Kurulumu (Opsiyonel)

PayTR Türkiye'deki tüm bankaları destekleyen yerli bir ödeme sistemidir. Detaylı kurulum için \`PAYTR_SETUP.md\` dosyasına bakın.

### 5. Veritabanı Migration
\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

### 6. Supabase Storage Bucket Oluşturma

Supabase Dashboard'da:
1. Storage > Create Bucket
2. Bucket adı: \`products\`
3. Public bucket olarak işaretleyin

### 7. Ödeme Sistemi Webhook Kurulumu

#### Stripe Webhook
Development için Stripe CLI:
\`\`\`bash
stripe listen --forward-to localhost:3000/api/webhook
\`\`\`

Production için Stripe Dashboard'dan webhook URL ekleyin:
- URL: \`https://yourdomain.com/api/webhook\`
- Events: \`checkout.session.completed\`

#### PayTR Webhook
PayTR panelinde "Ayarlar" > "Bildirim Ayarları":
- URL: \`https://yourdomain.com/api/webhooks/paytr\`

### 8. Test Kartları

#### Stripe Test Kartları
Stripe test modunda aşağıdaki kart numaralarını kullanabilirsiniz:

| Kart Numarası | Sonuç |
|---------------|-------|
| 4242 4242 4242 4242 | Başarılı ödeme |
| 4000 0000 0000 0002 | Kart reddedildi |
| 4000 0025 0000 3155 | 3D Secure doğrulama gerekli |
| 4000 0000 0000 9995 | Yetersiz bakiye |

- **Son kullanma tarihi**: Herhangi bir gelecek tarih
- **CVC**: Herhangi bir 3 haneli sayı
- **Posta kodu**: Herhangi bir değer

Daha fazla test kartı için: [Stripe Testing Documentation](https://stripe.com/docs/testing)

#### PayTR Test Kartları
PayTR test modunda:
- **Başarılı**: 4355 0840 0000 0001
- **Başarısız**: 4355 0840 0000 0002
- **CVV**: 000
- **3D Secure**: 123456

### 9. Geliştirme Sunucusunu Başlat
\`\`\`bash
npm run dev
\`\`\`

Site: http://localhost:3000

## 💳 Ödeme Sistemleri

Bu proje iki farklı ödeme sistemi destekler:

### Stripe
- Uluslararası müşteriler için ideal
- 135+ para birimi desteği
- Dünya çapında kullanılabilir
- Kurulum: \`STRIPE_SETUP.md\` (mevcut dokümantasyon)

### PayTR
- Türk müşteriler için optimize edilmiş
- Tüm Türk bankaları ile uyumlu
- TRY para birimi
- 12 taksit desteği
- Kurulum: \`PAYTR_SETUP.md\`

Kullanıcılar checkout sayfasında tercih ettikleri ödeme yöntemini seçebilirler.

## 📁 Proje Yapısı

\`\`\`
bs3dcrafts/
├── app/
│   ├── (routes)/
│   │   ├── page.tsx              # Ana sayfa
│   │   ├── products/             # Ürün sayfaları
│   │   ├── cart/                 # Sepet
│   │   ├── checkout/             # Ödeme
│   │   ├── success/              # Başarılı ödeme
│   │   ├── about/                # Hakkımızda
│   │   └── contact/              # İletişim
│   ├── admin/                    # Admin paneli
│   │   ├── page.tsx              # Dashboard
│   │   ├── products/             # Ürün yönetimi
│   │   └── orders/               # Sipariş yönetimi
│   └── api/
│       ├── checkout/             # Stripe checkout
│       └── webhook/              # Stripe webhook
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── product-card.tsx
│   ├── product-details.tsx
│   ├── cart-items.tsx
│   └── checkout-form.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client
│   ├── stripe.ts                 # Stripe client
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utility functions
├── store/
│   └── cart.ts                   # Zustand cart store
└── prisma/
    └── schema.prisma             # Database schema
\`\`\`

## 🎨 Tasarım Sistemi

### Renkler
- Background: Dark mode (HSL 240 10% 3.9%)
- Primary: White/Light (HSL 0 0% 98%)
- Accent: Subtle grays
- Border: Minimal contrast

### Tipografi
- Font: Inter
- Başlıklar: Bold, büyük punto
- Gövde: Regular, okunabilir

### Animasyonlar
- Hover effects: Subtle scale/translate
- Page transitions: Smooth fades
- Loading states: Spinner/skeleton

## 🔐 Güvenlik

- ✅ Stripe webhook signature doğrulama
- ✅ Environment variables
- ✅ SQL injection koruması (Prisma)
- ✅ XSS koruması (React)
- ✅ **HTTPS zorunlu (production)** - Stripe entegrasyonu için gerekli

**ÖNEMLİ**: Production ortamında `NEXT_PUBLIC_APP_URL` değişkeni mutlaka `https://` ile başlamalıdır. Detaylı bilgi için `DEPLOYMENT.md` dosyasına bakın.

## 📈 Performance

- ✅ Next.js Image optimization
- ✅ Lazy loading
- ✅ Code splitting
- ✅ CDN ready
- ✅ Database indexing

## 🚀 Deployment

### Vercel (Önerilen)
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### Environment Variables
Vercel dashboard'dan tüm .env değişkenlerini ekleyin.

### Database
- Supabase (önerilen)
- Railway
- Neon
- PlanetScale

## 📝 Yapılacaklar (Faz 2-3)

- [ ] 3D model preview (Three.js)
- [ ] Ürün filtreleme ve arama
- [ ] Kategori sistemi
- [ ] Kullanıcı hesapları
- [ ] Sipariş geçmişi
- [ ] Yorum sistemi
- [ ] Kupon sistemi
- [ ] Custom 3D sipariş
- [ ] Kargo entegrasyonu

## 📞 Destek

- Email: info@bs3dcrafts.co
- Website: https://bs3dcrafts.co

## 📄 Lisans

Tüm hakları saklıdır © 2024 BS3DCRAFTS.CO
