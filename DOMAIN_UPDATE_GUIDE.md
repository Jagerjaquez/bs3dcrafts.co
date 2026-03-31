# 🚀 Domain Güncelleme Rehberi

**Yeni Domain**: bs3dcrafts.com  
**Eski URL**: bs3dcrafts.vercel.app

---

## 1️⃣ Vercel Environment Variable Güncelleme

### Adım 1: Vercel Dashboard'a Git
```
https://vercel.com/dashboard
```

### Adım 2: Projeyi Seç
- `bs3dcrafts` projesine tıklayın

### Adım 3: Settings > Environment Variables
- Üst menüden **Settings** sekmesine tıklayın
- Sol menüden **Environment Variables** seçin

### Adım 4: NEXT_PUBLIC_SITE_URL Güncelle

**Mevcut değeri bulun:**
```
NEXT_PUBLIC_SITE_URL = https://bs3dcrafts.vercel.app
```

**Güncelleme adımları:**
1. Değerin sağındaki **⋮** (üç nokta) menüsüne tıklayın
2. **Edit** seçin
3. Yeni değeri girin:
   ```
   https://bs3dcrafts.com
   ```
4. Environment seçin: **Production**, **Preview**, **Development** (hepsini seçin)
5. **Save** butonuna tıklayın

### Adım 5: Redeploy
- **Deployments** sekmesine gidin
- En son deployment'ın sağındaki **⋮** menüsüne tıklayın
- **Redeploy** seçin
- **Redeploy to Production** butonuna tıklayın

---

## 2️⃣ Stripe Webhook URL Güncelleme

### Adım 1: Stripe Dashboard
```
https://dashboard.stripe.com/webhooks
```

### Adım 2: Webhook'u Bul
- Mevcut webhook'u bulun (bs3dcrafts.vercel.app içeren)

### Adım 3: Güncelle
1. Webhook'a tıklayın
2. **⋮** menüsünden **Update details** seçin
3. Endpoint URL'i güncelleyin:
   ```
   https://bs3dcrafts.com/api/webhooks/stripe
   ```
4. **Update endpoint** butonuna tıklayın

### Adım 4: Webhook Secret
- Webhook secret değişmedi, aynı kalacak
- `.env` dosyanızda zaten mevcut

---

## 3️⃣ PayTR Callback URL Güncelleme

### Adım 1: PayTR Merchant Panel
```
https://www.paytr.com/magaza/
```

### Adım 2: Mağaza Ayarları
- **Mağaza Ayarları** > **Bildirim Ayarları** bölümüne gidin

### Adım 3: Callback URL Güncelle
```
https://bs3dcrafts.com/api/webhooks/paytr
```

### Adım 4: Kaydet
- Değişiklikleri kaydedin

---

## 4️⃣ Google Search Console

### Adım 1: Search Console'a Git
```
https://search.google.com/search-console
```

### Adım 2: Property Ekle
1. **Add Property** butonuna tıklayın
2. **URL prefix** seçin
3. Domain girin:
   ```
   https://bs3dcrafts.com
   ```
4. **Continue** butonuna tıklayın

### Adım 3: Ownership Doğrulama
- **HTML tag** yöntemini seçin
- Meta tag'i kopyalayın
- `app/layout.tsx` dosyasına ekleyin (gerekirse)
- Veya Vercel otomatik doğrulama yapabilir

### Adım 4: Sitemap Gönder
```
https://bs3dcrafts.com/sitemap.xml
```

---

## 5️⃣ DNS Propagation Kontrolü

### Kontrol Araçları

**DNSChecker:**
```
https://dnschecker.org/#A/bs3dcrafts.com
```

**WhatsMyDNS:**
```
https://www.whatsmydns.net/#A/bs3dcrafts.com
```

### Beklenen Sonuçlar
- Tüm lokasyonlarda yeşil ✓ işareti
- Vercel IP adresine yönlendirme
- SSL sertifikası aktif

---

## 6️⃣ Test Checklist

### Ana Sayfa
- [ ] https://bs3dcrafts.com açılıyor
- [ ] SSL sertifikası aktif (🔒 ikonu)
- [ ] Tüm görseller yükleniyor

### Ürün Sayfaları
- [ ] https://bs3dcrafts.com/products çalışıyor
- [ ] Ürün detay sayfaları açılıyor
- [ ] Filtreleme çalışıyor

### Sepet ve Checkout
- [ ] Sepete ekleme çalışıyor
- [ ] Checkout sayfası açılıyor
- [ ] Stripe ödeme formu yükleniyor

### Admin Panel
- [ ] https://bs3dcrafts.com/admin/login açılıyor
- [ ] Giriş yapılabiliyor
- [ ] Ürün ekleme/düzenleme çalışıyor

### API Endpoints
- [ ] /api/admin/products çalışıyor
- [ ] /api/webhooks/stripe erişilebilir
- [ ] /api/webhooks/paytr erişilebilir

---

## 7️⃣ Opsiyonel: Google Analytics

### Adım 1: GA4 Property Ekle
```
https://analytics.google.com/
```

### Adım 2: Data Stream Güncelle
- Property Settings > Data Streams
- Web stream'i seçin
- URL'i güncelleyin: `https://bs3dcrafts.com`

---

## 🎉 Tamamlandı!

Domain başarıyla güncellendi. Artık siteniz:

```
🌐 https://bs3dcrafts.com
```

adresinden erişilebilir!

---

## 📞 Sorun Giderme

### Domain açılmıyor
- DNS propagation'ı bekleyin (5-48 saat)
- Vercel Dashboard'da domain durumunu kontrol edin
- SSL sertifikasının aktif olduğunu doğrulayın

### Webhook'lar çalışmıyor
- Stripe/PayTR panellerinde URL'leri kontrol edin
- Webhook secret'ların doğru olduğunu doğrulayın
- Vercel logs'larını kontrol edin

### SSL hatası
- Vercel otomatik SSL oluşturur, 1-2 dakika bekleyin
- Hard refresh yapın (Ctrl + Shift + R)
- Farklı tarayıcıda deneyin

---

**Son Güncelleme**: 31 Mart 2026
