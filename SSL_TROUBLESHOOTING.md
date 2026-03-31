# 🔒 SSL Sertifika Hatası Çözümü

**Hata**: `net::ERR_CERT_AUTHORITY_INVALID`  
**Domain**: bs3dcrafts.com

---

## ⚠️ Bu Hata Neden Oluşur?

1. SSL sertifikası henüz oluşturulmadı (5-10 dakika sürer)
2. DNS propagation tamamlanmadı (5-48 saat sürebilir)
3. Domain Vercel'e tam olarak bağlanmadı
4. Tarayıcı cache'i eski sertifikayı gösteriyor

---

## ✅ Çözüm Adımları

### Adım 1: Vercel Domain Durumunu Kontrol Et

1. **Vercel Dashboard'a git:**
   ```
   https://vercel.com/dashboard
   ```

2. **Projeyi seç:** `bs3dcrafts`

3. **Settings > Domains** sekmesine git

4. **Domain durumunu kontrol et:**

   **Doğru yapılandırma:**
   ```
   ✅ bs3dcrafts.com
      Status: Valid Configuration
      SSL: Active
      
   ✅ www.bs3dcrafts.com
      Status: Redirect to bs3dcrafts.com
      SSL: Active
   ```

   **Yanlış yapılandırma:**
   ```
   ⚠️ bs3dcrafts.com
      Status: Pending Verification
      SSL: Pending
   ```

### Adım 2: SSL Sertifikasını Yenile (Gerekirse)

Eğer SSL "Pending" durumundaysa:

1. Domain'in yanındaki **⋮** (üç nokta) menüsüne tıkla
2. **Refresh SSL Certificate** seçeneğini seç
3. 2-5 dakika bekle

### Adım 3: DNS Kayıtlarını Kontrol Et

**Vercel'den domain aldıysanız:**
- DNS otomatik yapılandırılmış olmalı
- Herhangi bir işlem yapmanıza gerek yok

**Kontrol araçları:**
```
https://dnschecker.org/#A/bs3dcrafts.com
https://www.whatsmydns.net/#A/bs3dcrafts.com
```

**Beklenen sonuç:**
- Tüm lokasyonlarda yeşil ✓
- Vercel IP adresine yönlendirme

### Adım 4: Tarayıcı Cache'ini Temizle

**Chrome/Edge:**
1. `Ctrl + Shift + Delete` tuşlarına bas
2. "Cached images and files" seç
3. "Clear data" butonuna tıkla
4. Sayfayı yenile: `Ctrl + Shift + R`

**Firefox:**
1. `Ctrl + Shift + Delete` tuşlarına bas
2. "Cache" seç
3. "Clear Now" butonuna tıkla
4. Sayfayı yenile: `Ctrl + Shift + R`

### Adım 5: Incognito/Private Modda Dene

1. Yeni bir incognito/private pencere aç
2. `https://bs3dcrafts.com` adresine git
3. Hata devam ediyor mu kontrol et

### Adım 6: Farklı Cihaz/Ağdan Dene

- Mobil cihazdan (WiFi kapalı, mobil veri ile)
- Farklı bir bilgisayardan
- VPN ile farklı lokasyondan

---

## 🕐 Bekleme Süreleri

### SSL Sertifikası Oluşturma
- **Normal süre:** 2-10 dakika
- **Maksimum süre:** 1 saat

### DNS Propagation
- **Vercel domain:** 5-30 dakika (genelde çok hızlı)
- **Harici domain:** 5-48 saat

---

## 🔧 Manuel SSL Sertifikası Yenileme

Eğer 1 saat sonra hala sorun devam ediyorsa:

### Yöntem 1: Vercel Dashboard

1. **Settings > Domains**
2. Domain'i seç
3. **⋮** > **Remove Domain**
4. Domain'i tekrar ekle
5. SSL otomatik oluşturulacak

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI yükle (eğer yoksa)
npm install -g vercel

# Login
vercel login

# Domain'i yeniden ekle
vercel domains add bs3dcrafts.com
```

---

## 📊 SSL Durumu Kontrol Komutları

### OpenSSL ile Kontrol
```bash
openssl s_client -connect bs3dcrafts.com:443 -servername bs3dcrafts.com
```

**Beklenen çıktı:**
```
SSL handshake has read 4234 bytes
Verify return code: 0 (ok)
```

### cURL ile Kontrol
```bash
curl -I https://bs3dcrafts.com
```

**Beklenen çıktı:**
```
HTTP/2 200
server: Vercel
```

---

## 🎯 Hızlı Çözüm Checklist

- [ ] Vercel Dashboard'da SSL durumu "Active" mı?
- [ ] DNS propagation tamamlandı mı? (dnschecker.org)
- [ ] Tarayıcı cache'i temizlendi mi?
- [ ] Incognito modda denendi mi?
- [ ] 10 dakika beklendi mi?
- [ ] Farklı cihazdan denendi mi?

---

## ⏰ Şu Anda Ne Yapmalısınız?

### Eğer domain'i yeni eklediyseniz (son 1 saat):
✅ **10-15 dakika bekleyin**
- SSL sertifikası otomatik oluşturulacak
- Bu süre zarfında hata normal

### Eğer 1 saatten fazla olduysa:
1. Vercel Dashboard'da SSL durumunu kontrol edin
2. "Refresh SSL Certificate" butonuna tıklayın
3. Vercel support'a ticket açın

---

## 🆘 Hala Çalışmıyorsa

### Vercel Support

**Email:**
```
support@vercel.com
```

**Mesaj şablonu:**
```
Subject: SSL Certificate Issue - bs3dcrafts.com

Hello,

I'm experiencing an SSL certificate error (ERR_CERT_AUTHORITY_INVALID) 
for my domain bs3dcrafts.com.

Project: bs3dcrafts
Domain: bs3dcrafts.com
Issue: SSL certificate not generating
Time elapsed: [X hours]

Could you please help refresh the SSL certificate?

Thank you!
```

---

## 🔄 Geçici Çözüm

SSL sertifikası oluşana kadar:

1. **Vercel subdomain kullanın:**
   ```
   https://bs3dcrafts.vercel.app
   ```
   Bu her zaman çalışır ve SSL'i vardır.

2. **HTTP kullanın (önerilmez):**
   ```
   http://bs3dcrafts.com
   ```
   Sadece test için, production'da kullanmayın!

---

## 📝 Notlar

- Vercel'den alınan domain'ler genelde 5-10 dakikada hazır olur
- SSL sertifikaları Let's Encrypt tarafından ücretsiz sağlanır
- Sertifikalar otomatik olarak 90 günde bir yenilenir
- Vercel'in SSL altyapısı çok güvenilirdir

---

**Son Güncelleme**: 31 Mart 2026

🎉 Genelde 10 dakika içinde sorun kendiliğinden çözülür!
