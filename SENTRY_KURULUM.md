# Sentry Monitoring Kurulum Rehberi

## 🎯 Genel Bakış

Sentry, sitenizde oluşan hataları, performans sorunlarını ve güvenlik olaylarını gerçek zamanlı olarak izlemenizi sağlar.

## 📋 Kurulum Adımları

### 1. Sentry Hesabı Oluşturma

1. **Sentry.io'ya gidin**: https://sentry.io
2. **Sign Up** butonuna tıklayın
3. **GitHub** veya **Email** ile kayıt olun (ücretsiz)
4. Hesabınızı onaylayın

### 2. Yeni Proje Oluşturma

1. Sentry Dashboard'da **"Create Project"** butonuna tıklayın
2. **Platform**: "Next.js" seçin
3. **Alert frequency**: "Alert me on every new issue" seçin
4. **Project name**: `bs3dcrafts` yazın
5. **Team**: Default team'i seçin
6. **"Create Project"** butonuna tıklayın

### 3. DSN'i Kopyalama

Proje oluşturulduktan sonra:

1. **DSN** (Data Source Name) otomatik gösterilecek
2. DSN şu formatta olacak: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
3. Bu DSN'i kopyalayın

### 4. Environment Variables Ekleme

#### Local Development (.env dosyası)

`.env` dosyasını açın ve şu satırları bulun:

```env
# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=bs3dcrafts
```

Şu şekilde doldurun:

```env
# Monitoring (Sentry)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=  # Şimdilik boş bırakabilirsiniz
SENTRY_ORG=your-organization-slug  # Sentry'deki organization adınız
SENTRY_PROJECT=bs3dcrafts
```

#### Production (Vercel)

1. **Vercel Dashboard**'a gidin: https://vercel.com
2. Projenizi seçin: **bs3dcrafts**
3. **Settings** > **Environment Variables**
4. Şu değişkenleri ekleyin:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx` | Production, Preview, Development |
| `SENTRY_ORG` | `your-organization-slug` | Production, Preview, Development |
| `SENTRY_PROJECT` | `bs3dcrafts` | Production, Preview, Development |

5. **Save** butonuna tıklayın

### 5. Auth Token Oluşturma (Opsiyonel - Source Maps için)

Source maps, hata mesajlarında orijinal kod satırlarını gösterir.

1. Sentry Dashboard > **Settings** > **Account** > **API** > **Auth Tokens**
2. **"Create New Token"** butonuna tıklayın
3. **Token name**: `bs3dcrafts-sourcemaps`
4. **Scopes**: 
   - `project:read`
   - `project:releases`
   - `org:read`
5. **"Create Token"** butonuna tıklayın
6. Token'ı kopyalayın (bir daha gösterilmeyecek!)
7. `.env` ve Vercel'e `SENTRY_AUTH_TOKEN` olarak ekleyin

## 🧪 Test Etme

### Local Test

1. Development server'ı başlatın:
```bash
npm run dev
```

2. Tarayıcıda test endpoint'ine gidin:
```
http://localhost:3000/api/test-sentry
```

3. Şu mesajı görmelisiniz:
```json
{
  "success": true,
  "message": "Test events sent to Sentry",
  "tests": [
    "Basic error tracking",
    "Custom event",
    "Business metric",
    "Security event"
  ]
}
```

4. **Sentry Dashboard**'a gidin: https://sentry.io
5. **Issues** sekmesinde test error'unu görmelisiniz
6. Error'a tıklayarak detayları inceleyin

### Production Test

1. Vercel'e deploy edin:
```bash
git add .
git commit -m "feat: add Sentry monitoring"
git push origin main
```

2. Deploy tamamlandıktan sonra:
```
https://bs3dcrafts.vercel.app/api/test-sentry
```

3. Sentry Dashboard'da production error'larını kontrol edin

## 📊 Sentry Dashboard Kullanımı

### Issues (Hatalar)

- **Issues** sekmesinde tüm hataları görürsünüz
- Her hata için:
  - Stack trace (kod satırları)
  - User context (kullanıcı bilgileri)
  - Breadcrumbs (hata öncesi olaylar)
  - Environment (production/development)
  - Release (hangi versiyonda oluştu)

### Performance

- **Performance** sekmesinde:
  - API response times
  - Page load times
  - Slow queries
  - Transaction details

### Alerts

Otomatik bildirim almak için:

1. **Alerts** > **Create Alert**
2. **Alert type**: "Issues"
3. **Conditions**: 
   - "When an event is first seen"
   - "When an event occurs more than X times"
4. **Actions**: Email, Slack, PagerDuty
5. **Save Alert**

## 🔧 Kod İçinde Kullanım

### Error Tracking

```typescript
import { trackError } from '@/lib/monitoring'

try {
  await riskyOperation()
} catch (error) {
  trackError(error as Error, {
    category: 'payment',
    severity: 'critical',
    metadata: {
      orderId: '123',
      amount: 299.99,
    },
    userId: user.id,
  })
}
```

### Business Metrics

```typescript
import { BusinessMetrics } from '@/lib/monitoring'

// Sipariş oluşturuldu
BusinessMetrics.orderCreated('order_123', 299.99)

// Ödeme başarısız
BusinessMetrics.paymentFailed('order_123', 299.99, 'insufficient_funds')

// Ürün görüntülendi
BusinessMetrics.productViewed('product_456', '3D Printed Vase')
```

### Security Events

```typescript
import { SecurityEvents } from '@/lib/monitoring'

// Şüpheli aktivite
SecurityEvents.suspiciousActivity('Multiple failed login attempts', {
  ipAddress: '192.168.1.1',
  attempts: 5,
})

// Brute force denemesi
SecurityEvents.bruteForceAttempt('192.168.1.1', 10)
```

### User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/monitoring'

// Login sonrası
setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Logout sonrası
clearUserContext()
```

## 💰 Maliyet

### Free Plan (Developer)
- ✅ 5,000 errors/month
- ✅ 10,000 transactions/month
- ✅ 1 user
- ✅ 30 days data retention
- ✅ **Küçük siteler için yeterli**

### Team Plan ($26/month)
- ✅ 50,000 errors/month
- ✅ 100,000 transactions/month
- ✅ Unlimited users
- ✅ 90 days data retention
- ✅ **Orta büyüklükte siteler için**

### Business Plan ($80/month)
- ✅ 150,000 errors/month
- ✅ 300,000 transactions/month
- ✅ Unlimited users
- ✅ 90 days data retention
- ✅ Priority support
- ✅ **Büyük siteler için**

**Tavsiye**: Free plan ile başlayın, gerekirse upgrade edin.

## 🎯 Production Checklist

Sentry'yi production'a almadan önce:

- [ ] Sentry hesabı oluşturuldu
- [ ] Proje oluşturuldu (bs3dcrafts)
- [ ] DSN kopyalandı
- [ ] `.env` dosyasına DSN eklendi
- [ ] Vercel environment variables eklendi
- [ ] Local test yapıldı (`/api/test-sentry`)
- [ ] Sentry Dashboard'da test error görüldü
- [ ] Production'a deploy edildi
- [ ] Production test yapıldı
- [ ] Alert'ler yapılandırıldı
- [ ] Team üyeleri davet edildi (opsiyonel)

## 🔍 Troubleshooting

### Sentry'ye event gitmiyor

1. **DSN doğru mu?**
   - `.env` dosyasını kontrol edin
   - Vercel environment variables'ı kontrol edin

2. **Environment variables yüklendi mi?**
   - Vercel'de redeploy yapın
   - Local'de server'ı restart edin

3. **Network bağlantısı var mı?**
   - Browser console'da network tab'ı kontrol edin
   - Firewall/VPN Sentry'yi blokluyor olabilir

### Çok fazla event gidiyor

1. **Sample rate'i düşürün**:
   ```typescript
   // sentry.client.config.ts
   tracesSampleRate: 0.1, // %10
   replaysSessionSampleRate: 0.01, // %1
   ```

2. **Ignore errors ekleyin**:
   ```typescript
   ignoreErrors: [
     'ResizeObserver loop limit exceeded',
     'Non-Error promise rejection captured',
   ]
   ```

### Source maps yüklenmiyor

1. **Auth token var mı?**
   - `SENTRY_AUTH_TOKEN` environment variable'ı ekleyin

2. **Organization/Project doğru mu?**
   - `SENTRY_ORG` ve `SENTRY_PROJECT` kontrol edin

3. **Build log'larını kontrol edin**:
   ```bash
   npm run build
   ```

## 📚 Kaynaklar

- **Sentry Docs**: https://docs.sentry.io
- **Next.js Integration**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Dashboard**: https://sentry.io
- **BS3DCrafts Support**: bs3dcrafts.co@outlook.com

## ✅ Sonraki Adımlar

Sentry kurulumu tamamlandıktan sonra:

1. **Email sistemi kurulumu** (Resend)
2. **Analytics kurulumu** (Google Analytics)
3. **Performance optimization**
4. **SEO improvements**

---

**Not**: Sentry kurulumu opsiyoneldir ama production'da şiddetle tavsiye edilir. Hataları gerçek zamanlı görmek ve kullanıcı deneyimini iyileştirmek için çok önemlidir.
