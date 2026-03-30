# Ödeme Entegrasyonu Özeti

Bu proje iki farklı ödeme sistemi ile entegre edilmiştir: **Stripe** ve **PayTR**.

## Genel Bakış

```
┌─────────────────┐
│  Checkout Form  │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Seçim   │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
┌───▼────┐          ┌────▼────┐
│ Stripe │          │  PayTR  │
└───┬────┘          └────┬────┘
    │                    │
    │ Webhook            │ Webhook
    │                    │
┌───▼────────────────────▼────┐
│   Order Management System   │
└─────────────────────────────┘
```

## Dosya Yapısı

### PayTR Dosyaları (Yeni Eklenenler)
```
bs3dcrafts/
├── lib/
│   └── paytr-client.ts              # PayTR API client
├── app/
│   └── api/
│       ├── checkout/
│       │   └── paytr/
│       │       └── route.ts         # PayTR checkout endpoint
│       └── webhooks/
│           └── paytr/
│               └── route.ts         # PayTR webhook handler
├── components/
│   └── checkout-form.tsx            # Güncellenmiş (ödeme seçimi eklendi)
├── PAYTR_SETUP.md                   # PayTR kurulum rehberi
└── .env.example                     # PayTR env değişkenleri eklendi
```

### Mevcut Stripe Dosyaları
```
bs3dcrafts/
├── lib/
│   └── stripe-client.ts             # Stripe API client
├── app/
│   └── api/
│       ├── checkout/
│       │   └── session/
│       │       └── route.ts         # Stripe checkout endpoint
│       └── webhooks/
│           └── stripe/
│               └── route.ts         # Stripe webhook handler
```

## API Endpoints

### Checkout Endpoints

#### Stripe Checkout
```
POST /api/checkout/session
```
**Request Body:**
```json
{
  "items": [
    {
      "id": "product-id",
      "name": "Product Name",
      "price": 100.00,
      "quantity": 1
    }
  ],
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+905551234567",
    "address": "Address"
  }
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### PayTR Checkout
```
POST /api/checkout/paytr
```
**Request Body:** (Stripe ile aynı)

**Response:**
```json
{
  "token": "paytr_token_...",
  "url": "https://www.paytr.com/odeme/guvenli/...",
  "orderId": "ORDER-..."
}
```

### Webhook Endpoints

#### Stripe Webhook
```
POST /api/webhooks/stripe
```
- Stripe'dan gelen ödeme bildirimlerini işler
- Signature doğrulaması yapar
- Sipariş durumunu günceller

#### PayTR Webhook
```
POST /api/webhooks/paytr
```
- PayTR'den gelen ödeme bildirimlerini işler
- Hash doğrulaması yapar
- Sipariş durumunu günceller

## Environment Variables

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PayTR
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_TEST_MODE=true

# Ortak
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Kullanıcı Akışı

1. Kullanıcı sepete ürün ekler
2. Checkout sayfasına gider
3. Ödeme yöntemini seçer (Stripe veya PayTR)
4. Müşteri bilgilerini doldurur
5. "Ödemeye Geç" butonuna tıklar
6. Seçilen ödeme sisteminin sayfasına yönlendirilir
7. Ödeme işlemini tamamlar
8. Başarılı ise `/success` sayfasına yönlendirilir
9. Webhook ile sipariş durumu güncellenir

## Güvenlik

### Stripe
- Webhook signature doğrulaması
- HTTPS zorunlu (production)
- PCI DSS uyumlu

### PayTR
- HMAC-SHA256 hash doğrulaması
- Merchant key/salt ile güvenlik
- 3D Secure desteği

## Test Etme

### Stripe Test Kartları
- Başarılı: `4242 4242 4242 4242`
- Reddedildi: `4000 0000 0000 0002`

### PayTR Test Kartları
- Başarılı: `4355 0840 0000 0001`
- Başarısız: `4355 0840 0000 0002`
- CVV: `000`
- 3D Secure: `123456`

## Karşılaştırma

| Özellik | Stripe | PayTR |
|---------|--------|-------|
| Hedef Pazar | Uluslararası | Türkiye |
| Para Birimi | 135+ | TRY |
| Taksit | Sınırlı | 12 taksit |
| Komisyon | ~2.9% + $0.30 | ~2.5-3% |
| Kurulum | Kolay | Orta |
| Dokümantasyon | Mükemmel | İyi |
| Test Modu | Var | Var |

## Sorun Giderme

### Stripe
- Webhook secret'ı kontrol edin
- HTTPS kullanıldığından emin olun
- Stripe CLI ile local test yapın

### PayTR
- Merchant bilgilerini doğrulayın
- Hash hesaplamasını kontrol edin
- Test modunun aktif olduğundan emin olun

## Gelecek Geliştirmeler

- [ ] iyzico entegrasyonu
- [ ] Kripto para desteği
- [ ] Abonelik ödemeleri
- [ ] Otomatik fatura oluşturma
- [ ] Çoklu para birimi desteği
- [ ] Ödeme planları

## Kaynaklar

- [Stripe Dokümantasyon](https://stripe.com/docs)
- [PayTR Dokümantasyon](https://dev.paytr.com)
- [PAYTR_SETUP.md](./PAYTR_SETUP.md) - Detaylı PayTR kurulum rehberi
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment rehberi
