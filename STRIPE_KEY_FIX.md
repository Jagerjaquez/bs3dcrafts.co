# 🔧 Stripe Key Sorunu Çözümü

## Sorun

502 Bad Gateway hatası alıyorsunuz. Bu Stripe API'ye bağlanırken oluşan bir hata.

**Muhtemel Sebepler:**
1. Stripe secret key geçersiz veya yanlış
2. Stripe hesabı askıya alınmış
3. Stripe API'ye erişim sorunu

## Çözüm: Stripe Key'leri Yenileyin

### Adım 1: Stripe Dashboard'a Gidin

https://dashboard.stripe.com/test/apikeys

### Adım 2: Yeni Key'leri Kopyalayın

**Publishable Key** (pk_test_ ile başlayan)
**Secret Key** (sk_test_ ile başlayan)

### Adım 3: Vercel'de Key'leri Güncelleyin

```powershell
# Eski key'leri silin
vercel env rm NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env rm STRIPE_SECRET_KEY production

# Yeni key'leri ekleyin
echo 'YENI_PUBLISHABLE_KEY' | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
echo 'YENI_SECRET_KEY' | vercel env add STRIPE_SECRET_KEY production

# Deploy edin
vercel --prod
```

### Adım 4: .env Dosyasını Güncelleyin

`.env` dosyasındaki key'leri de güncelleyin:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YENI_KEY
STRIPE_SECRET_KEY=sk_test_YENI_KEY
```

## Alternatif: Stripe Test Mode Kontrolü

Stripe Dashboard'da **Test Mode** açık mı kontrol edin:
- Dashboard'ın sol üst köşesinde "Test mode" yazıyor olmalı
- Test mode kapalıysa açın
- Test key'leri kullanıyorsanız test mode açık olmalı

## Stripe Hesap Durumu

Stripe hesabınız aktif mi kontrol edin:
- https://dashboard.stripe.com/settings/account
- Hesap durumu: Active olmalı
- Eğer "Restricted" veya "Suspended" ise Stripe support ile iletişime geçin

## Hızlı Test

Stripe key'leriniz çalışıyor mu test edin:

```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u sk_test_SIZIN_SECRET_KEY: \
  -d "success_url=https://example.com/success" \
  -d "cancel_url=https://example.com/cancel" \
  -d "line_items[0][price_data][currency]=try" \
  -d "line_items[0][price_data][product_data][name]=Test" \
  -d "line_items[0][price_data][unit_amount]=10000" \
  -d "line_items[0][quantity]=1" \
  -d "mode=payment"
```

Eğer bu çalışıyorsa key'ler doğru demektir.

## Bana Verin

Yeni Stripe key'lerinizi bana verin, ben Vercel'e ekleyeyim:

1. Publishable Key (pk_test_...)
2. Secret Key (sk_test_...)

---

**Not:** Stripe key'leri hassas bilgilerdir. Sadece test key'lerini paylaşın, production key'leri asla paylaşmayın!
