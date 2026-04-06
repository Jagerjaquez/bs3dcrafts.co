# PayTR Entegrasyonu Rehberi

Bu dokümanda BS3DCrafts e-ticaret sitesinin PayTR ödeme sistemi entegrasyonu açıklanmaktadır.

## 🚀 Özellikler

- ✅ PayTR ile güvenli ödeme işlemi
- ✅ Tüm Türk bankaları desteği
- ✅ 12 taksit seçeneği
- ✅ 3D Secure doğrulama
- ✅ Test ve canlı mod desteği
- ✅ Webhook ile otomatik sipariş güncelleme
- ✅ Hata yönetimi ve loglama
- ✅ Rate limiting koruması
- ✅ Input validation ve güvenlik

## 📋 Gereksinimler

- PayTR merchant hesabı
- Merchant ID, Key ve Salt değerleri
- HTTPS destekli domain (canlı mod için)

## ⚙️ Konfigürasyon

### Environment Variables

`.env` dosyasına aşağıdaki değerleri ekleyin:

```env
# PayTR Ayarları
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_TEST_MODE=true  # Test modu için true, canlı için false

# Site URL'leri
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### PayTR Panel Ayarları

PayTR merchant panelinde aşağıdaki ayarları yapın:

1. **Başarılı Ödeme URL'i**: `https://yourdomain.com/success`
2. **Başarısız Ödeme URL'i**: `https://yourdomain.com/checkout`
3. **Bildirim URL'i**: `https://yourdomain.com/api/webhooks/paytr`

## 🔄 Ödeme Akışı

### 1. Checkout İşlemi

```typescript
// Frontend'den checkout API'sine istek
const response = await fetch('/api/checkout/paytr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      {
        id: 'product-1',
        name: 'Ürün Adı',
        price: 100,
        quantity: 2
      }
    ],
    customerInfo: {
      name: 'Müşteri Adı',
      email: 'musteri@email.com',
      phone: '+905551234567',
      address: 'Müşteri Adresi'
    }
  })
})

const data = await response.json()
if (data.url) {
  window.location.href = data.url // PayTR ödeme sayfasına yönlendir
}
```

### 2. PayTR Ödeme Sayfası

- Müşteri PayTR'ın güvenli ödeme sayfasında kart bilgilerini girer
- 3D Secure doğrulaması yapılır
- Ödeme sonucu PayTR tarafından webhook'a bildirilir

### 3. Webhook İşlemi

PayTR ödeme sonucunu `/api/webhooks/paytr` endpoint'ine POST eder:

```typescript
// Webhook verileri
{
  merchant_oid: 'ORDER123456789',
  status: 'success', // veya 'failed'
  total_amount: '250.00',
  payment_type: 'card',
  installment_count: '1',
  currency: 'TRY',
  test_mode: '1'
}
```

### 4. Sipariş Güncelleme

- Webhook doğrulanır
- Sipariş durumu güncellenir (`paid` veya `failed`)
- Müşteri başarı/hata sayfasına yönlendirilir

## 🧪 Test Kartları

PayTR test modunda aşağıdaki kartları kullanabilirsiniz:

### Başarılı Test Kartı
- **Kart No**: 4355 0840 0000 0001
- **Son Kullanma**: Gelecekteki herhangi bir tarih
- **CVV**: 000
- **3D Şifre**: 123456

### Başarısız Test Kartı
- **Kart No**: 4355 0840 0000 0002
- **Son Kullanma**: Gelecekteki herhangi bir tarih
- **CVV**: 000
- **3D Şifre**: 123456

## 🔒 Güvenlik

### Hash Doğrulama

Webhook'larda PayTR'dan gelen verilerin doğruluğu hash ile kontrol edilir:

```typescript
const hashStr = [
  merchant_oid,
  merchant_salt,
  status,
  total_amount
].join('')

const calculatedHash = crypto
  .createHmac('sha256', merchant_key)
  .update(hashStr)
  .digest('base64')

const isValid = hash === calculatedHash
```

### Input Validation

- Tüm kullanıcı girdileri validate edilir
- XSS ve SQL injection koruması
- Rate limiting ile DDoS koruması
- Maksimum string uzunlukları kontrol edilir

## 📊 Sipariş Yönetimi

### Sipariş Durumları

- `pending`: Ödeme bekleniyor
- `paid`: Ödeme tamamlandı
- `shipped`: Kargo verildi
- `completed`: Sipariş tamamlandı
- `failed`: Ödeme başarısız

### Admin Paneli

Admin panelinden siparişleri görüntüleyebilir ve durumlarını güncelleyebilirsiniz:

- `/admin/orders` - Tüm siparişler
- `/admin/orders/[id]` - Sipariş detayı

## 🐛 Hata Ayıklama

### Log Kontrolü

PayTR işlemleri console'da loglanır:

```bash
# Checkout işlemi
=== PayTR Client Debug ===
Merchant ID: 688326
Payment Amount: 25000
=====================

# Webhook işlemi
PayTR Payment Callback: {
  merchant_oid: 'ORDER123456789',
  status: 'success',
  total_amount: '250.00',
  order_status: 'paid'
}
```

### Yaygın Hatalar

1. **Token alınamıyor**
   - Merchant bilgilerini kontrol edin
   - Test modunda olduğunuzdan emin olun
   - PayTR API'sinin erişilebilir olduğunu kontrol edin

2. **Webhook çalışmıyor**
   - Webhook URL'inin HTTPS olduğundan emin olun
   - PayTR panelinde doğru URL'i ayarladığınızdan emin olun
   - Hash doğrulamasının çalıştığını kontrol edin

3. **Sipariş bulunamıyor**
   - Merchant OID'nin doğru olduğundan emin olun
   - Veritabanı bağlantısını kontrol edin

## 🧪 Test Etme

Entegrasyonu test etmek için:

```bash
# Test suite'i çalıştır
npm test paytr-integration

# Tek bir test çalıştır
npm test -- --testNamePattern="should create a PayTR order"
```

## 📈 Monitoring

### Önemli Metrikler

- Başarılı ödeme oranı
- Ortalama ödeme süresi
- Hata oranları
- Webhook gecikmeleri

### Alertler

Aşağıdaki durumlar için alert kurulması önerilir:

- Webhook başarısızlık oranı %5'i geçerse
- PayTR API yanıt süresi 5 saniyeyi geçerse
- Ödeme başarısızlık oranı %10'u geçerse

## 🚀 Canlıya Alma

Canlı ortama geçmek için:

1. PayTR'dan canlı merchant bilgilerini alın
2. `PAYTR_TEST_MODE=false` yapın
3. Canlı domain'i PayTR panelinde ayarlayın
4. SSL sertifikasının aktif olduğundan emin olun
5. Webhook URL'inin erişilebilir olduğunu test edin

## 📞 Destek

- PayTR Destek: https://www.paytr.com/destek
- PayTR Dokümantasyon: https://dev.paytr.com/
- BS3DCrafts Teknik Destek: admin@bs3dcrafts.com