# 🔐 Admin Giriş Rehberi

## Ürün Ekleme Sorunu Çözüldü! ✅

Admin panel artık güvenli giriş sistemi ile korunuyor.

---

## Hızlı Başlangıç

### 1. Admin Giriş Sayfasına Git

**URL:** https://bs3dcrafts.vercel.app/admin/login

### 2. Admin Şifresini Gir

```
AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=
```

### 3. Ürün Ekle

- "Yeni Ürün" butonuna tıkla
- Formu doldur
- Fotoğraf yükle
- Kaydet

---

## Önemli Notlar

### Güvenlik

- ✅ Admin şifresi browser'da güvenli şekilde saklanıyor (sessionStorage)
- ✅ Her API isteğinde otomatik authentication
- ✅ Sayfa yenilendiğinde tekrar giriş gerekiyor (güvenlik için)

### Şifre Nerede?

Admin şifresi `.env` dosyasındaki `ADMIN_SECRET` değeridir:

```env
ADMIN_SECRET=AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=
```

### Şifreyi Değiştirmek İsterseniz

1. `.env` dosyasında `ADMIN_SECRET` değerini değiştirin
2. Vercel'de environment variable'ı güncelleyin:
   ```powershell
   vercel env rm ADMIN_SECRET production
   echo 'YENI_SIFRE' | vercel env add ADMIN_SECRET production
   ```
3. Yeniden deploy edin:
   ```powershell
   vercel --prod
   ```

---

## Nasıl Çalışıyor?

### Frontend (Browser)

1. Kullanıcı `/admin/login` sayfasına gider
2. Admin şifresini girer
3. Şifre `sessionStorage` içinde saklanır
4. Her API isteğinde şifre `Authorization: Bearer <ADMIN_SECRET>` header'ı olarak gönderilir

### Backend (API)

1. API endpoint'leri `requireAdminAuth()` middleware'i ile korunuyor
2. Her istekte `Authorization` header'ı kontrol ediliyor
3. Şifre doğruysa işlem devam ediyor
4. Şifre yanlışsa `401 Unauthorized` hatası dönüyor

---

## Sorun Giderme

### "Admin şifresi gerekli" Hatası

**Sebep:** SessionStorage'da şifre yok

**Çözüm:** 
1. `/admin/login` sayfasına gidin
2. Şifreyi tekrar girin

### "Yetkisiz erişim" (401) Hatası

**Sebep:** Yanlış şifre veya şifre değişmiş

**Çözüm:**
1. Browser console'u açın (F12)
2. `sessionStorage.clear()` yazın
3. Sayfayı yenileyin
4. Doğru şifreyi girin

### Fotoğraf Yüklenmiyor

**Sebep:** Supabase storage bucket yok veya yanlış konfigüre edilmiş

**Çözüm:**
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Storage > Buckets
3. `products` bucket'ını kontrol edin
4. Yoksa oluşturun (Public bucket olarak)

---

## Gelecek İyileştirmeler

### Şu Anda

- ✅ Basit şifre girişi
- ✅ SessionStorage ile saklama
- ✅ Otomatik authentication

### Gelecekte Eklenebilir

- 🔄 Cookie-based authentication (daha güvenli)
- 🔄 Çoklu admin kullanıcıları
- 🔄 Role-based access control (RBAC)
- 🔄 2-factor authentication (2FA)
- 🔄 Admin activity logs

---

## Test Etme

### 1. Giriş Testi

```
1. https://bs3dcrafts.vercel.app/admin/login adresine git
2. Şifreyi gir: AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=
3. "Giriş Yap" butonuna tıkla
4. Admin panel açılmalı
```

### 2. Ürün Ekleme Testi

```
1. "Yeni Ürün" butonuna tıkla
2. Formu doldur:
   - Ürün Adı: Test Ürün
   - Kategori: Dekorasyon
   - Fiyat: 100
   - Stok: 10
   - Ağırlık: 50
   - Üretim Süresi: 2 saat
   - Açıklama: Test açıklama
3. "Ürünü Kaydet" butonuna tıkla
4. Ürün başarıyla eklenmeli
```

### 3. Fotoğraf Yükleme Testi

```
1. "Fotoğraf Seç" butonuna tıkla
2. Bir resim dosyası seç
3. Fotoğraf yüklenmeli ve önizleme görünmeli
```

---

## Yardım

Sorun yaşıyorsanız:

1. Browser console'u kontrol edin (F12 > Console)
2. Network tab'ı kontrol edin (F12 > Network)
3. Hata mesajını kopyalayın
4. `TROUBLESHOOTING.md` dosyasına bakın

---

**Başarılar! 🚀**

Artık admin panelinden güvenli bir şekilde ürün ekleyebilirsiniz.
