# 🚀 Supabase Kurulum Rehberi

## Adım 1: Supabase'den Bilgileri Al

### 1️⃣ Database Connection String (2 adet)

**Supabase Dashboard** > **Project Settings** (⚙️) > **Database** sekmesi

#### A) Connection Pooling (DATABASE_URL)
1. **Connection string** bölümünde **URI** sekmesini seç
2. **"Use connection pooling"** kutucuğunu işaretle ✅
3. **Mode**: Transaction
4. Connection string'i kopyala:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

#### B) Direct Connection (DIRECT_URL)
1. **Connection string** bölümünde **URI** sekmesini seç
2. **"Use connection pooling"** kutucuğunu KALDIR ❌
3. **Mode**: Session
4. Connection string'i kopyala:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

⚠️ **ÖNEMLİ**: Her iki connection string'de de `[YOUR-PASSWORD]` kısmını proje oluştururken belirlediğin şifre ile değiştir!

---

### 2️⃣ Supabase API Keys

**Supabase Dashboard** > **Project Settings** (⚙️) > **API** sekmesi

Şu 3 değeri kopyala:

1. **Project URL** (URL)
   ```
   https://xxxxx.supabase.co
   ```

2. **anon public** key
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **service_role** key (🔒 Show butonuna tıkla)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Adım 2: .env Dosyasını Güncelle

`bs3dcrafts/.env` dosyasını aç ve şu satırları doldur:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="BURAYA_CONNECTION_POOLING_URL_YAPISTIR"
DIRECT_URL="BURAYA_DIRECT_CONNECTION_URL_YAPISTIR"

# Supabase Storage & Auth
NEXT_PUBLIC_SUPABASE_URL="BURAYA_PROJECT_URL_YAPISTIR"
NEXT_PUBLIC_SUPABASE_ANON_KEY="BURAYA_ANON_PUBLIC_KEY_YAPISTIR"
SUPABASE_SERVICE_ROLE_KEY="BURAYA_SERVICE_ROLE_KEY_YAPISTIR"
```

### Örnek (Doldurulmuş):
```env
DATABASE_URL="postgresql://postgres.abcdefgh:MySecurePass123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.abcdefgh:MySecurePass123@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://abcdefgh.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY..."
```

---

## Adım 3: Database Migration & Seed

Terminal'de şu komutları çalıştır:

```bash
# 1. Prisma Client'ı yeniden oluştur
npx prisma generate

# 2. Database migration'ı çalıştır (tabloları oluştur)
npx prisma migrate dev --name init

# 3. Örnek ürünleri ekle (10 ürün)
npx tsx prisma/seed.ts

# 4. Prisma Studio ile kontrol et (opsiyonel)
npx prisma studio
```

### Beklenen Çıktı:

```
✅ Migration başarılı
✅ 10 ürün eklendi
✅ Database hazır!
```

---

## Adım 4: Supabase Storage Kurulumu (Ürün Görselleri İçin)

### 1️⃣ Bucket Oluştur

1. **Supabase Dashboard** > **Storage** (sol menü)
2. **"New bucket"** butonuna tıkla
3. **Name**: `products`
4. **Public bucket**: ✅ İşaretle (görseller herkese açık olacak)
5. **"Create bucket"** butonuna tıkla

### 2️⃣ Bucket Policies Ayarla

1. `products` bucket'ına tıkla
2. **Policies** sekmesine git
3. **"New policy"** > **"For full customization"**
4. Şu policy'leri ekle:

**Policy 1: Public Read (Herkes görebilir)**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );
```

**Policy 2: Authenticated Upload (Giriş yapanlar yükleyebilir)**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );
```

### 3️⃣ Görselleri Yükle

1. **Storage** > **products** bucket'ı
2. **Upload file** butonuna tıkla
3. Ürün görsellerini yükle (örn: `product1.jpg`, `product2.jpg`, ...)

### 4️⃣ Public URL'leri Al

Yüklenen her görsel için public URL:
```
https://xxxxx.supabase.co/storage/v1/object/public/products/product1.jpg
```

---

## Adım 5: Test Et

```bash
# Development server'ı başlat
npm run dev
```

Tarayıcıda aç: http://localhost:3000

### Kontrol Listesi:
- [ ] Ana sayfa açılıyor
- [ ] Ürünler sayfasında 10 ürün görünüyor
- [ ] Ürün detay sayfası açılıyor
- [ ] Sepete ekleme çalışıyor
- [ ] Console'da database hatası yok

---

## 🔧 Sorun Giderme

### "Environment variable not found: DATABASE_URL"
- `.env` dosyasını kontrol et
- Tırnak işaretleri doğru mu?
- Development server'ı yeniden başlat

### "Can't reach database server"
- Connection string doğru mu?
- Şifre doğru mu? (özel karakterler varsa URL encode et)
- Supabase projesi aktif mi?

### "Migration failed"
- `DIRECT_URL` eklenmiş mi?
- Internet bağlantısı var mı?
- Supabase dashboard'da database erişilebilir mi?

### Şifrede Özel Karakterler Varsa
Şifrede `@`, `#`, `$` gibi karakterler varsa URL encode et:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`

Örnek:
```
Şifre: MyPass@123
Encoded: MyPass%40123
```

---

## 📚 Yararlı Komutlar

```bash
# Prisma Studio (database GUI)
npx prisma studio

# Migration durumunu kontrol et
npx prisma migrate status

# Database'i sıfırla (DİKKAT: Tüm veriyi siler!)
npx prisma migrate reset

# Yeni migration oluştur
npx prisma migrate dev --name migration_name

# Production migration
npx prisma migrate deploy
```

---

## ✅ Kurulum Tamamlandı!

Artık Supabase PostgreSQL database'i kullanıyorsun. Sıradaki adımlar:

1. ✅ Gerçek ürün verisi ekle
2. ✅ Ürün görsellerini Supabase Storage'a yükle
3. ✅ Stripe entegrasyonunu test et
4. ✅ Admin panel ile ürün yönetimi

---

**Yardıma mı ihtiyacın var?**
- Supabase Docs: https://supabase.com/docs
- Prisma Docs: https://www.prisma.io/docs
- Discord: https://discord.supabase.com
