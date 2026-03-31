# Sentry Dashboard'da Hataları Görme Rehberi

## 🎯 Hata Mesajlarını Görmek İçin

### 1. Doğru Projeyi Seçin

Sentry Dashboard'da sol üst köşede:
- **Project seçici** var
- **"bs3dcrafts"** projesini seçin
- Eğer birden fazla proje varsa, doğru projeyi seçtiğinizden emin olun

### 2. Issues Sekmesine Gidin

Sol menüden:
- **"Issues"** sekmesine tıklayın
- Veya direkt: https://sentry.io/issues/

### 3. Filtreleri Kontrol Edin

Sağ üstte filtreler var:

#### Environment Filter
- **"All Environments"** seçili olmalı
- Veya **"production"** seçin
- Eğer başka bir environment seçiliyse, hataları göremezsiniz

#### Time Range
- **"Last 24 hours"** veya **"Last 7 days"** seçin
- Eğer çok dar bir zaman aralığı seçiliyse, eski hataları göremezsiniz

#### Status Filter
- **"Unresolved"** seçili olmalı
- Veya **"All"** seçin
- Eğer "Resolved" seçiliyse, sadece çözülmüş hataları görürsünüz

### 4. Arama Yapın

Üstteki arama kutusuna:
```
is:unresolved
```
yazın ve Enter'a basın.

Veya:
```
environment:production
```

### 5. Manuel Test Gönderin

Tarayıcınızda şu URL'yi açın:
```
https://bs3dcrafts.vercel.app/api/test-sentry
```

Şu mesajı görmelisiniz:
```json
{
  "success": true,
  "message": "Test events sent to Sentry"
}
```

Sonra Sentry Dashboard'ı yenileyin (F5).

## 🔍 Göreceğiniz Hata Mesajları

Test endpoint'i 4 farklı event gönderir:

### 1. Error Event
- **Title**: "Error: Test error from Sentry - This is a test!"
- **Type**: Error
- **Level**: Info (mavi)
- **Environment**: production
- **Tags**: category=test, severity=low

### 2. Custom Event
- **Title**: "sentry_test_event"
- **Type**: Message
- **Level**: Info
- **Category**: test

### 3. Business Metric
- **Title**: "order_created"
- **Type**: Message
- **Level**: Info
- **Category**: business
- **Metadata**: orderId=test-order-123, amount=299.99

### 4. Security Event
- **Title**: "suspicious_activity"
- **Type**: Message
- **Level**: Info
- **Category**: security

## 🎨 Sentry Dashboard Görünümü

### Issues Listesi

Her issue için görecekleriniz:
```
┌─────────────────────────────────────────────────┐
│ 🔴 Error: Test error from Sentry               │
│ production • 2 minutes ago • 1 event            │
│ Tags: category=test, severity=low              │
└─────────────────────────────────────────────────┘
```

### Issue Detayları

Bir issue'ya tıkladığınızda:

1. **Overview Tab**:
   - Error mesajı
   - Stack trace
   - Occurrence count
   - First seen / Last seen

2. **Breadcrumbs Tab**:
   - Hata öncesi olaylar
   - API çağrıları
   - User actions

3. **Tags Tab**:
   - category
   - severity
   - environment
   - release

4. **Context Tab**:
   - metadata
   - user info
   - device info

## 🚨 Hata Göremiyorsanız

### Kontrol Listesi:

- [ ] **Doğru proje seçili mi?** (bs3dcrafts)
- [ ] **Issues sekmesinde misiniz?**
- [ ] **Environment filter "All" veya "production" mu?**
- [ ] **Time range yeterince geniş mi?** (Last 24h veya Last 7d)
- [ ] **Status filter "Unresolved" veya "All" mu?**
- [ ] **Sayfayı yenilediniz mi?** (F5)
- [ ] **Test endpoint'i çalıştırdınız mı?**

### Adım Adım Kontrol:

1. **Sol üst köşe**: "bs3dcrafts" yazıyor mu?
   - Hayır → Proje seçiciye tıklayın, bs3dcrafts'ı seçin

2. **Sol menü**: "Issues" seçili mi?
   - Hayır → Issues'a tıklayın

3. **Sağ üst**: Environment ne diyor?
   - "production" veya "All Environments" olmalı
   - Değilse → Tıklayın ve değiştirin

4. **Sağ üst**: Time range ne diyor?
   - "Last 24 hours" veya daha geniş olmalı
   - Değilse → Tıklayın ve "Last 7 days" seçin

5. **Üst kısım**: Herhangi bir filtre var mı?
   - Varsa → "Clear filters" butonuna tıklayın

6. **Sayfa**: Boş mu?
   - Evet → Test endpoint'i tekrar çalıştırın
   - Sonra F5 ile sayfayı yenileyin

## 🔄 Gerçek Zamanlı Test

### Terminal'de:

```powershell
# 5 kez test gönder
for ($i=1; $i -le 5; $i++) {
    Write-Host "Test $i gönderiliyor..."
    curl https://bs3dcrafts.vercel.app/api/test-sentry -UseBasicParsing
    Start-Sleep -Seconds 2
}
```

### Tarayıcıda:

1. Yeni sekme açın
2. https://bs3dcrafts.vercel.app/api/test-sentry
3. Sayfayı 5 kez yenileyin (F5)
4. Sentry Dashboard'a dönün
5. Sayfayı yenileyin (F5)

## 📊 Alternatif Görünümler

### All Events

Eğer Issues'da göremiyorsanız:

1. Sol menüden **"Discover"** sekmesine gidin
2. Veya: https://sentry.io/discover/
3. Burada tüm event'leri görebilirsiniz
4. Filter: `event.type:error OR event.type:message`

### Performance

1. Sol menüden **"Performance"** sekmesine gidin
2. `/api/test-sentry` endpoint'ini göreceksiniz
3. Transaction'lara tıklayarak detayları görebilirsiniz

## 🎯 Başarı Göstergeleri

Sentry doğru çalışıyorsa görecekleriniz:

1. **Issues sekmesinde**:
   - En az 1 error (Test error from Sentry)
   - En az 3 message (custom event, business metric, security event)

2. **Discover sekmesinde**:
   - Son 24 saatte 4+ event

3. **Performance sekmesinde**:
   - `/api/test-sentry` transaction'ları

## 📧 Email Bildirimleri

Sentry otomatik email gönderiyor mu kontrol edin:

1. Email kutunuzu açın
2. "Sentry" veya "sentry.io" araması yapın
3. Şu email'leri görmüş olabilirsiniz:
   - "New Issue: Test error from Sentry"
   - "Weekly Report"
   - "Alert Triggered"

## 🔔 Bildirim Ayarları

Email bildirimleri almıyorsanız:

1. Sağ üst köşede profil resminize tıklayın
2. **"User Settings"** > **"Notifications"**
3. **"Alerts"** bölümünde:
   - "Email" aktif olmalı
   - "Workflow notifications" aktif olmalı
4. **"Projects"** bölümünde:
   - "bs3dcrafts" için bildirimler aktif olmalı

## ✅ Sonuç

Eğer hala hata göremiyorsanız:

1. **Test endpoint'i tekrar çalıştırın**:
   ```
   https://bs3dcrafts.vercel.app/api/test-sentry
   ```

2. **2-3 dakika bekleyin** (Sentry'nin işlemesi zaman alabilir)

3. **Sayfayı yenileyin** (F5)

4. **Farklı sekmeleri kontrol edin**:
   - Issues
   - Discover
   - Performance

5. **Email'lerinizi kontrol edin**

Hala sorun varsa, ekran görüntüsü paylaşabilirsiniz!

---

**Not**: İlk event'lerin Sentry'ye ulaşması 1-2 dakika sürebilir. Sabırlı olun ve sayfayı birkaç kez yenileyin.
