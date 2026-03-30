# Email Sistemi Kurulum Rehberi

## Genel Bakış

BS3DCrafts platformu, sipariş onayları ve bildirimler için **Resend** email servisi kullanmaktadır.

## Özellikler

✅ Müşteriye sipariş onay emaili  
✅ Admin'e yeni sipariş bildirimi  
✅ Modern, responsive email template'leri  
✅ React ile yazılmış email component'leri  
✅ Otomatik email gönderimi (webhook'lar üzerinden)

---

## Kurulum Adımları

### 1. Resend Hesabı Oluşturma

1. [Resend.com](https://resend.com) adresine gidin
2. Ücretsiz hesap oluşturun (ayda 3,000 email ücretsiz)
3. Email adresinizi doğrulayın

### 2. Domain Doğrulama (Önerilen)

**Önemli**: Production'da kendi domain'inizden email göndermek için domain doğrulaması gereklidir.

1. Resend Dashboard > Domains
2. "Add Domain" butonuna tıklayın
3. Domain'inizi girin (örn: `bs3dcrafts.com`)
4. Verilen DNS kayıtlarını domain sağlayıcınıza ekleyin:
   - SPF record
   - DKIM record
   - DMARC record (opsiyonel ama önerilen)
5. "Verify DNS Records" ile doğrulayın

**DNS Kayıtları Örneği**:
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [Resend'in verdiği DKIM değeri]
```

### 3. API Key Alma

1. Resend Dashboard > API Keys
2. "Create API Key" butonuna tıklayın
3. İsim verin (örn: "BS3DCrafts Production")
4. Permission: "Sending access"
5. API key'i kopyalayın (bir daha gösterilmeyecek!)

### 4. Environment Variables Ayarlama

`.env` dosyanıza ekleyin:

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Email Adresleri
EMAIL_FROM="BS3DCrafts <orders@bs3dcrafts.com>"
EMAIL_REPLY_TO="support@bs3dcrafts.com"
ADMIN_EMAIL="admin@bs3dcrafts.com"

# Base URL (email'lerdeki linkler için)
NEXT_PUBLIC_BASE_URL=https://bs3dcrafts.com
```

**Notlar**:
- `EMAIL_FROM`: Müşterilere gönderilen email'lerin gönderen adresi
- `EMAIL_REPLY_TO`: Müşteriler "Reply" dediğinde gidecek adres
- `ADMIN_EMAIL`: Yeni sipariş bildirimlerinin gideceği admin email adresi

### 5. Vercel'de Environment Variables

Production deployment için:

1. Vercel Dashboard > Project > Settings > Environment Variables
2. Yukarıdaki değişkenleri ekleyin
3. Environment: "Production", "Preview", "Development" (hepsini seçin)
4. "Save" butonuna tıklayın
5. Redeploy yapın

---

## Test Etme

### Local Test

```bash
# Development server'ı başlatın
npm run dev

# Test siparişi oluşturun
# Stripe test card: 4242 4242 4242 4242
```

### Email Gönderimini Kontrol Etme

1. Resend Dashboard > Logs
2. Son gönderilen email'leri görün
3. Delivery status'ü kontrol edin
4. Email içeriğini preview edin

### Test API Endpoint'i (Opsiyonel)

Email sistemini test etmek için:

```typescript
// app/api/test-email/route.ts
import { NextResponse } from 'next/server'
import { sendOrderEmails } from '@/lib/email-service'

export async function GET() {
  const result = await sendOrderEmails({
    orderNumber: '#TEST123',
    orderDate: new Date(),
    customerName: 'Test Müşteri',
    customerEmail: 'test@example.com',
    customerPhone: '+90 555 123 4567',
    items: [
      { name: 'Test Ürün', quantity: 1, price: 100 }
    ],
    subtotal: 100,
    shipping: 10,
    total: 110,
    paymentMethod: 'Stripe',
    shippingAddress: {
      line1: 'Test Adres',
      city: 'İstanbul',
      state: 'İstanbul',
      postalCode: '34000',
      country: 'Turkey',
    },
  })
  
  return NextResponse.json(result)
}
```

Tarayıcıda: `http://localhost:3000/api/test-email`

---

## Email Template'leri

### 1. Sipariş Onay Emaili (Müşteri)

**Dosya**: `emails/order-confirmation.tsx`

**İçerik**:
- Sipariş numarası ve tarihi
- Sipariş detayları (ürünler, fiyatlar)
- Teslimat adresi
- Sipariş takip linki
- İletişim bilgileri

### 2. Yeni Sipariş Bildirimi (Admin)

**Dosya**: `emails/admin-order-notification.tsx`

**İçerik**:
- Sipariş özeti
- Müşteri bilgileri (ad, email, telefon)
- Sipariş detayları
- Teslimat adresi
- Admin panel linki

### Template'leri Özelleştirme

Email template'lerini düzenlemek için:

```bash
# Email preview server'ı başlatın
npx react-email dev
```

Tarayıcıda `http://localhost:3000` adresine gidin ve template'leri canlı olarak düzenleyin.

---

## Sorun Giderme

### Email Gönderilmiyor

1. **API Key Kontrolü**:
   ```bash
   # .env dosyasını kontrol edin
   cat .env | grep RESEND_API_KEY
   ```

2. **Resend Dashboard Logs**:
   - Resend > Logs bölümünden hata mesajlarını kontrol edin

3. **Domain Doğrulaması**:
   - Domain DNS kayıtlarının doğru eklendiğinden emin olun
   - `nslookup` veya `dig` ile DNS kayıtlarını kontrol edin

4. **Rate Limiting**:
   - Ücretsiz plan: 3,000 email/ay, 100 email/gün
   - Limit aşıldıysa upgrade yapın

### Email Spam'e Düşüyor

1. **SPF, DKIM, DMARC Kayıtları**:
   - Tüm DNS kayıtlarının doğru eklendiğinden emin olun

2. **Email İçeriği**:
   - Spam trigger kelimelerden kaçının
   - Dengeli text/HTML oranı kullanın
   - Unsubscribe linki ekleyin (opsiyonel)

3. **Sender Reputation**:
   - Yeni domain'ler için email gönderimini yavaş artırın
   - Bounce rate'i düşük tutun

### Email Görünümü Bozuk

1. **Email Client Testi**:
   - Gmail, Outlook, Apple Mail'de test edin
   - [Litmus](https://litmus.com) veya [Email on Acid](https://www.emailonacid.com) kullanın

2. **Inline Styles**:
   - React Email otomatik olarak inline styles kullanır
   - External CSS çalışmaz

---

## Production Checklist

- [ ] Resend hesabı oluşturuldu
- [ ] Domain doğrulandı (SPF, DKIM, DMARC)
- [ ] API key alındı
- [ ] Environment variables ayarlandı
- [ ] Vercel'de env variables eklendi
- [ ] Test email gönderildi ve alındı
- [ ] Email template'leri özelleştirildi
- [ ] Admin email adresi doğru ayarlandı
- [ ] Spam testi yapıldı
- [ ] Mobile görünüm test edildi

---

## Maliyet

**Resend Pricing**:
- Free: 3,000 emails/ay, 100 emails/gün
- Pro: $20/ay, 50,000 emails/ay
- Enterprise: Custom pricing

**Tahmini Kullanım**:
- Her sipariş = 2 email (müşteri + admin)
- 100 sipariş/ay = 200 email/ay (Free plan yeterli)
- 1,000 sipariş/ay = 2,000 email/ay (Free plan yeterli)
- 2,000+ sipariş/ay = Pro plan gerekli

---

## Gelecek İyileştirmeler

- [ ] Sipariş durumu güncelleme emaili
- [ ] Kargo takip numarası emaili
- [ ] Terk edilmiş sepet hatırlatma emaili
- [ ] Ürün önerisi emaili
- [ ] Newsletter sistemi
- [ ] Email analytics (açılma, tıklama oranları)

---

## Destek

- Resend Docs: https://resend.com/docs
- React Email Docs: https://react.email/docs
- BS3DCrafts Support: support@bs3dcrafts.com
