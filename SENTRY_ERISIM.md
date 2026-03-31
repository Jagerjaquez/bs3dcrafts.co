# Sentry Dashboard Erişim Rehberi

## ✅ Durum: Sentry Aktif ve Çalışıyor!

Production test başarılı: https://bs3dcrafts.vercel.app/api/test-sentry

## 🔐 Sentry Dashboard'a Erişim

### Yöntem 1: Direkt Link
https://sentry.io/auth/login/

### Yöntem 2: Email ile Giriş
1. https://sentry.io adresine gidin
2. Sağ üstte **"Sign In"** butonuna tıklayın
3. Sentry hesabı oluştururken kullandığınız **email** ve **şifre** ile giriş yapın

### Yöntem 3: GitHub ile Giriş
Eğer GitHub ile kayıt olduysanız:
1. https://sentry.io adresine gidin
2. **"Sign in with GitHub"** butonuna tıklayın
3. GitHub hesabınızla giriş yapın

### Yöntem 4: Google ile Giriş
Eğer Google ile kayıt olduysanız:
1. https://sentry.io adresine gidin
2. **"Sign in with Google"** butonuna tıklayın
3. Google hesabınızla giriş yapın

## 🔍 Sentry Dashboard'da Nereye Bakmalı

Giriş yaptıktan sonra:

### 1. Issues (Hatalar)
- Sol menüden **"Issues"** sekmesine tıklayın
- Şu test error'unu görmelisiniz:
  - **"Test error from Sentry - This is a test!"**
  - Environment: **production**
  - Timestamp: Son 10 dakika içinde
  - Category: **test**

### 2. Error Detayları
Test error'una tıklayınca görecekleriniz:
- **Stack Trace**: Hatanın oluştuğu kod satırları
- **Breadcrumbs**: Hata öncesi olaylar
- **Tags**: category=test, severity=low
- **Context**: metadata bilgileri
- **Environment**: production

### 3. Performance
- Sol menüden **"Performance"** sekmesine tıklayın
- API endpoint'lerinin response time'larını görebilirsiniz
- `/api/test-sentry` endpoint'ini göreceksiniz

### 4. Releases
- Sol menüden **"Releases"** sekmesine tıklayın
- Her deployment için ayrı release göreceksiniz
- Hangi release'de kaç hata olduğunu görebilirsiniz

## 🎯 Sentry'de Göreceğiniz Test Event'leri

Production test'ten gönderilen 4 event:

1. **Basic Error Tracking**
   - Type: Error
   - Message: "Test error from Sentry - This is a test!"
   - Category: test
   - Severity: low

2. **Custom Event**
   - Type: Message
   - Name: "sentry_test_event"
   - Category: test
   - Severity: low

3. **Business Metric**
   - Type: Message
   - Name: "order_created"
   - Category: business
   - Metadata: orderId=test-order-123, amount=299.99

4. **Security Event**
   - Type: Message
   - Name: "suspicious_activity"
   - Category: security
   - Description: "Test security event"

## 🔧 Sentry Dashboard Kullanımı

### Filtreleme
- **Environment**: production, development, preview
- **Status**: unresolved, resolved, ignored
- **Level**: error, warning, info, debug
- **Time Range**: Last 24h, 7d, 30d, custom

### Alert Kurulumu
1. Sol menüden **"Alerts"** > **"Create Alert"**
2. **Alert type**: "Issues"
3. **Conditions**: 
   - "When an event is first seen" (yeni hata)
   - "When an event occurs more than X times" (tekrarlayan hata)
4. **Actions**: Email notification
5. **Save Alert**

### Team Üyeleri Ekleme
1. Sol menüden **"Settings"** > **"Teams"**
2. **"Invite Member"** butonuna tıklayın
3. Email adresi girin
4. Role seçin (Admin, Member, Billing)
5. **"Send Invite"** butonuna tıklayın

## 🚨 Sorun Giderme

### "Sentry.io açılmıyor"

**Olası Nedenler:**
1. **İnternet bağlantısı**: Bağlantınızı kontrol edin
2. **VPN/Firewall**: VPN veya firewall Sentry'yi blokluyor olabilir
3. **DNS sorunu**: DNS cache'i temizleyin
4. **Tarayıcı cache**: Tarayıcı cache'ini temizleyin

**Çözümler:**

1. **Farklı tarayıcı deneyin**:
   - Chrome
   - Firefox
   - Edge
   - Safari

2. **Incognito/Private mode**:
   - Ctrl+Shift+N (Chrome)
   - Ctrl+Shift+P (Firefox)

3. **DNS Cache temizle**:
   ```powershell
   ipconfig /flushdns
   ```

4. **VPN kapatın** (eğer kullanıyorsanız)

5. **Direkt IP ile erişim**:
   - Sentry.io IP'sini ping edin
   - Hosts dosyasını kontrol edin

6. **Mobil cihazdan deneyin**:
   - Telefonunuzdan https://sentry.io açın
   - Farklı network'ten erişim test edin

### "Hesap şifremi unuttum"

1. https://sentry.io/auth/login/ adresine gidin
2. **"Forgot password?"** linkine tıklayın
3. Email adresinizi girin
4. Email'inize gelen linke tıklayın
5. Yeni şifre belirleyin

### "Event'ler görünmüyor"

1. **Environment filter'ı kontrol edin**:
   - Sağ üstte environment seçili mi?
   - "All Environments" seçin

2. **Time range'i genişletin**:
   - "Last 24 hours" yerine "Last 7 days" seçin

3. **Project seçili mi**:
   - Sol üstte "bs3dcrafts" projesi seçili olmalı

4. **Test tekrar çalıştırın**:
   ```
   https://bs3dcrafts.vercel.app/api/test-sentry
   ```

## 📱 Mobil Uygulama

Sentry'nin mobil uygulaması var:
- **iOS**: App Store'dan "Sentry" uygulamasını indirin
- **Android**: Play Store'dan "Sentry" uygulamasını indirin

Mobil uygulamadan da tüm error'ları ve alert'leri görebilirsiniz.

## 📧 Email Bildirimleri

Sentry otomatik email gönderir:
- Yeni error oluştuğunda
- Alert koşulları sağlandığında
- Haftalık/aylık raporlar

Email'lerinizi kontrol edin, Sentry'den bildirim gelmiş olabilir.

## ✅ Sonuç

Sentry başarıyla kuruldu ve çalışıyor! Production'da test başarılı.

Eğer Sentry Dashboard'a erişemiyorsanız:
1. Farklı tarayıcı deneyin
2. Incognito mode kullanın
3. VPN'i kapatın
4. Mobil cihazdan deneyin
5. Email'lerinizi kontrol edin (Sentry'den bildirim gelmiş olabilir)

---

**Destek**: Sorun devam ederse, Sentry support'a yazabilirsiniz: https://sentry.io/support/
