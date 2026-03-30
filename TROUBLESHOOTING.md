# 🔧 Sorun Giderme Rehberi

## ✅ ÇÖZÜLDÜ: Ürün Eklerken Hata Alıyorum

### Çözüm: Admin Giriş Sistemi Eklendi

Admin panel artık giriş sistemi ile korunuyor. Ürün eklemek için:

1. **Admin Giriş Sayfasına Gidin**
   - URL: https://bs3dcrafts.vercel.app/admin/login
   - Veya direkt admin paneline gittiğinizde otomatik yönlendirileceksiniz

2. **Admin Şifresini Girin**
   - Şifre: `AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=`
   - Bu şifre .env dosyasındaki ADMIN_SECRET değeridir

3. **Ürün Ekleyin**
   - Giriş yaptıktan sonra "Yeni Ürün" butonuna tıklayın
   - Formu doldurun ve kaydedin
   - Artık authentication otomatik olarak ekleniyor

### Nasıl Çalışıyor?

- Admin şifresi browser'ın sessionStorage'ında saklanıyor
- Her API isteğinde otomatik olarak `Authorization: Bearer <ADMIN_SECRET>` header'ı ekleniyor
- Sayfa yenilendiğinde veya yeni sekmede açıldığında tekrar giriş yapmanız gerekiyor (güvenlik için)

---

## Olası Sebepler ve Çözümler (Eski Sorunlar)

---

## 1. Database Migration Yapılmamış

**Belirti**: "Table does not exist" veya "relation does not exist" hatası

**Çözüm**:
```powershell
cd bs3dcrafts

# Prisma client oluştur
npm run db:generate

# Migration'ları çalıştır
npx prisma migrate deploy

# Veya
npx prisma db push
```

---

## 2. Authentication Hatası (401 Unauthorized)

**Belirti**: "Yetkisiz erişim" veya "401 Unauthorized"

**Sebep**: Admin panel'e erişim için authentication gerekiyor

**Çözüm**: 

### Yöntem A: Browser'dan (Geçici)
Admin panel şu anda browser'dan direkt erişilebilir değil. API üzerinden çalışıyor.

### Yöntem B: API ile (Postman/curl)

```bash
# Ürün ekleme
curl -X POST https://bs3dcrafts.vercel.app/api/admin/products \
  -H "Authorization: Bearer AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Ürün",
    "slug": "test-urun",
    "description": "Test açıklama",
    "price": 100,
    "stock": 10,
    "category": "Dekorasyon",
    "material": "PLA",
    "printTimeEstimate": "2 saat",
    "weight": 50,
    "featured": false
  }'
```

---

## 3. File Upload Hatası

**Belirti**: Resim yüklenemiyor

**Sebep**: Supabase storage bucket yok veya yanlış konfigüre edilmiş

**Çözüm**:

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Storage > Buckets
4. `products` bucket'ı var mı kontrol edin
5. Yoksa oluşturun:
   - Name: `products`
   - Public bucket: ✅
   - Create

---

## 4. CORS Hatası

**Belirti**: "CORS policy" hatası

**Çözüm**: Supabase CORS ayarları

1. Supabase Dashboard > Storage > Configuration
2. CORS policies ekleyin
3. Allowed origins: `https://bs3dcrafts.vercel.app`

---

## 5. Environment Variables Eksik

**Belirti**: "Environment variable not found"

**Kontrol**:
```powershell
vercel env ls
```

**Çözüm**: Eksik değişkenleri ekleyin
```powershell
vercel env add VARIABLE_NAME production
```

---

## Hızlı Tanı

### Adım 1: Hangi Sayfadasınız?

**A) Admin Panel (Browser)**
- URL: https://bs3dcrafts.vercel.app/admin/products/new
- Sorun: Form submit edilemiyor
- Çözüm: Aşağıdaki "Admin Panel Sorunu" bölümüne bakın

**B) API (Postman/curl)**
- Endpoint: POST /api/admin/products
- Sorun: 401 veya 500 hatası
- Çözüm: Authentication veya Database sorununa bakın

### Adım 2: Hata Mesajı Nedir?

**"401 Unauthorized"**
→ Authentication sorunu (Çözüm #2)

**"Table/relation does not exist"**
→ Database migration sorunu (Çözüm #1)

**"File upload failed"**
→ Supabase storage sorunu (Çözüm #3)

**"CORS policy"**
→ CORS sorunu (Çözüm #4)

---

## Admin Panel Sorunu (Özel)

Admin panel şu anda API authentication gerektiriyor ama browser'dan direkt erişim için session yok.

### Geçici Çözüm: API ile Ürün Ekleyin

1. Postman veya Insomnia kurun
2. Yeni request oluşturun:
   - Method: POST
   - URL: `https://bs3dcrafts.vercel.app/api/admin/products`
   - Headers:
     - `Authorization: Bearer AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=`
     - `Content-Type: application/json`
   - Body (JSON):
```json
{
  "name": "3D Baskı Vazo",
  "slug": "3d-baski-vazo",
  "description": "Özel tasarım modern vazo",
  "price": 150,
  "stock": 5,
  "category": "Dekorasyon",
  "material": "PLA",
  "printTimeEstimate": "3 saat",
  "weight": 100,
  "featured": true,
  "images": []
}
```

### Kalıcı Çözüm: Admin Login Sistemi

Admin panel için login sistemi eklemek gerekiyor. Bu biraz kod değişikliği gerektirir.

---

## Database Migration (Detaylı)

Eğer database hatası alıyorsanız:

```powershell
# 1. .env dosyasını kontrol edin
cat .env | Select-String "DATABASE_URL"

# 2. Prisma client oluştur
npx prisma generate

# 3. Migration'ları uygula
npx prisma migrate deploy

# 4. Alternatif: db push
npx prisma db push

# 5. Bağlantıyı test et
npx prisma db pull
```

---

## Vercel Logs Kontrol

```powershell
# Son hataları gör
vercel logs https://bs3dcrafts.vercel.app

# Veya Vercel Dashboard'dan
# https://vercel.com/berkinunverr63-2960s-projects/bs3dcrafts
```

---

## Test Senaryosu

### 1. Database Test
```powershell
npx prisma studio
```
Browser'da açılacak, tabloları görebilirsiniz.

### 2. API Test
```bash
# Ürünleri listele (authentication gerekli)
curl -X GET https://bs3dcrafts.vercel.app/api/admin/products \
  -H "Authorization: Bearer AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI="
```

### 3. Upload Test
```bash
# File upload test
curl -X POST https://bs3dcrafts.vercel.app/api/upload \
  -H "Authorization: Bearer AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=" \
  -F "file=@test-image.jpg"
```

---

## Acil Çözüm: Seed Data

Eğer hiçbir şey çalışmıyorsa, seed data ile test ürünleri ekleyin:

```powershell
# Seed script çalıştır
npx tsx prisma/seed.ts
```

---

## İletişim

Hala sorun devam ediyorsa:
1. Tam hata mesajını kopyalayın
2. Hangi sayfada olduğunuzu belirtin
3. Browser console'u kontrol edin (F12)
4. Network tab'ı kontrol edin

**Hata mesajını buraya yazın, size yardımcı olayım!**
