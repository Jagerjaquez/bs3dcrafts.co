# WhatsApp Butonu Test Rehberi

## 🔍 Sorun Giderme

### 1. Tarayıcı Cache'ini Temizle

**Chrome/Edge:**
1. `Ctrl + Shift + Delete` tuşlarına bas
2. "Cached images and files" seç
3. "Clear data" butonuna tıkla
4. Sayfayı hard refresh yap: `Ctrl + Shift + R`

**Firefox:**
1. `Ctrl + Shift + Delete` tuşlarına bas
2. "Cache" seç
3. "Clear Now" butonuna tıkla
4. Sayfayı hard refresh yap: `Ctrl + Shift + R`

### 2. Incognito/Private Mode'da Test Et

1. Yeni bir incognito/private pencere aç (`Ctrl + Shift + N`)
2. https://bs3dcrafts.com adresine git
3. WhatsApp butonuna tıkla

### 3. Deployment Durumunu Kontrol Et

Vercel Dashboard:
```
https://vercel.com/dashboard
```

1. `bs3dcrafts` projesini seç
2. **Deployments** sekmesine git
3. En son deployment'ın durumunu kontrol et
4. "Ready" olmalı

### 4. Console'da Hata Kontrolü

1. Sayfada `F12` tuşuna bas
2. **Console** sekmesine git
3. WhatsApp butonuna tıkla
4. Hata var mı kontrol et

### 5. Manuel Test

Tarayıcıda bu URL'i aç:
```
https://wa.me/905464519597?text=Merhaba!%20BS3DCrafts%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.
```

Bu çalışıyorsa, sorun butonda değil deployment'tadır.

---

## 🧪 Local Test

Local'de test etmek için:

```bash
cd bs3dcrafts
npm run dev
```

Sonra http://localhost:3000 adresine git ve WhatsApp butonunu test et.

---

## ✅ Beklenen Davranış

WhatsApp butonuna tıkladığınızda:
1. Yeni bir pencere/sekme açılmalı
2. WhatsApp Web veya WhatsApp uygulaması açılmalı
3. Numara: 905464519597
4. Mesaj: "Merhaba! BS3DCrafts ürünleri hakkında bilgi almak istiyorum."

---

## 🔧 Alternatif Çözüm

Eğer hala çalışmıyorsa, butonu test etmek için:

1. Sayfada `F12` tuşuna bas
2. **Console** sekmesine git
3. Şu kodu yapıştır ve Enter'a bas:

```javascript
window.open('https://wa.me/905464519597?text=Merhaba!%20BS3DCrafts%20%C3%BCr%C3%BCnleri%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum.', '_blank')
```

Bu çalışıyorsa, sorun butonda değil başka bir yerdedir.

---

## 📱 Mobil Test

Mobil cihazdan test ederken:
1. WhatsApp uygulaması yüklü olmalı
2. Butona tıkladığınızda direkt uygulama açılmalı
3. Mesaj otomatik gelmelidir

---

## ⏰ Deployment Süresi

Vercel deployment'ı genelde 1-2 dakika sürer. Eğer 5 dakikadan fazla olduysa:

1. Vercel Dashboard'da deployment durumunu kontrol edin
2. Hata varsa logs'lara bakın
3. Gerekirse manuel redeploy yapın
