# PayTR Ödeme Entegrasyonu Kurulum Rehberi

Bu proje PayTR ödeme sistemini desteklemektedir. PayTR, Türkiye'deki tüm bankaları destekleyen yerli bir ödeme altyapısıdır.

## Özellikler

- ✅ Tüm Türk bankaları ile uyumlu
- ✅ 3D Secure güvenlik
- ✅ Taksit desteği (12 taksit)
- ✅ Test modu
- ✅ Webhook desteği
- ✅ Stripe ile birlikte çalışabilir

## Kurulum Adımları

### 1. PayTR Hesabı Oluşturma

1. [PayTR](https://www.paytr.com) web sitesine gidin
2. "Üye Ol" butonuna tıklayın
3. Gerekli bilgileri doldurun ve hesabınızı oluşturun
4. E-posta doğrulamasını tamamlayın

### 2. Merchant Bilgilerini Alma

1. PayTR hesabınıza giriş yapın
2. "Ayarlar" > "Bilgilerim" bölümüne gidin
3. Aşağıdaki bilgileri not edin:
   - **Merchant ID**: Üye işyeri numaranız
   - **Merchant Key**: API anahtarınız
   - **Merchant Salt**: Güvenlik anahtarınız

### 3. Ortam Değişkenlerini Ayarlama

`.env` dosyanıza aşağıdaki değişkenleri ekleyin:

\`\`\`env
# PayTR
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_TEST_MODE=true  # Canlıya geçerken false yapın
\`\`\`

### 4. Webhook URL'ini Ayarlama

PayTR'nin ödeme sonuçlarını bildirmesi için webhook URL'i ayarlamanız gerekir:

1. PayTR panelinde "Ayarlar" > "Bildirim Ayarları" bölümüne gidin
2. **Bildirim URL'i** alanına şu adresi girin:
   \`\`\`
   https://yourdomain.com/api/webhooks/paytr
   \`\`\`
3. Değişiklikleri kaydedin

### 5. Test Etme

Test modunda ödeme yapmak için:

1. Uygulamayı başlatın: \`npm run dev\`
2. Sepete ürün ekleyin
3. Checkout sayfasında "PayTR" seçeneğini seçin
4. Müşteri bilgilerini doldurun
5. "Ödemeye Geç" butonuna tıklayın

PayTR test kartları:
- **Başarılı Ödeme**: 4355 0840 0000 0001
- **Başarısız Ödeme**: 4355 0840 0000 0002

Test kartları için:
- Son kullanma tarihi: Gelecekteki herhangi bir tarih
- CVV: 000
- 3D Secure şifresi: 123456

## Canlıya Geçiş

1. PayTR'den canlı hesap onayı alın
2. `.env` dosyasında \`PAYTR_TEST_MODE=false\` yapın
3. Webhook URL'inin canlı domain'inizi gösterdiğinden emin olun
4. Gerçek bir ödeme ile test edin

## Güvenlik Notları

- ⚠️ Merchant Key ve Salt değerlerini asla public repository'lere commit etmeyin
- ⚠️ Webhook endpoint'i her zaman hash doğrulaması yapar
- ⚠️ Tüm ödeme bilgileri PayTR tarafından işlenir, sizin sunucunuzda kart bilgisi saklanmaz

## Sorun Giderme

### "Token generation failed" hatası
- Merchant bilgilerinizi kontrol edin
- Test modunun doğru ayarlandığından emin olun
- PayTR API'sinin erişilebilir olduğunu kontrol edin

### Webhook çalışmıyor
- Webhook URL'inin doğru olduğundan emin olun
- HTTPS kullanıldığından emin olun (canlı ortamda zorunlu)
- PayTR panelinde webhook loglarını kontrol edin

### Ödeme başarılı ama sipariş güncellenmedi
- Webhook endpoint'inin çalıştığını kontrol edin
- Database bağlantısını kontrol edin
- Server loglarını inceleyin

## Destek

- PayTR Dokümantasyon: https://dev.paytr.com
- PayTR Destek: destek@paytr.com
- PayTR Telefon: 0850 532 26 96

## Stripe ile Birlikte Kullanım

Bu proje hem PayTR hem de Stripe'ı destekler. Kullanıcılar checkout sayfasında tercih ettikleri ödeme yöntemini seçebilirler:

- **PayTR**: Türk müşteriler için önerilir
- **Stripe**: Uluslararası müşteriler için önerilir

Her iki ödeme sistemi de aynı sipariş yönetim sistemini kullanır.
