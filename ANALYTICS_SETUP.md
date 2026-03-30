# 📊 Google Analytics Kurulum Rehberi

Google Analytics'i aktif hale getirmek için bu adımları izleyin.

---

## 1. Google Analytics Hesabı Oluşturun

1. [Google Analytics](https://analytics.google.com/) adresine gidin
2. Yeni bir hesap oluşturun
3. Web sitesi için bir property oluşturun
4. **Measurement ID**'nizi alın (örnek: `G-XXXXXXXXXX`)

---

## 2. Environment Variable Ekleyin

### Vercel'de:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Local .env dosyasına:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 3. Layout'a Analytics Component'ini Ekleyin

`app/layout.tsx` dosyasını açın ve Analytics component'ini ekleyin:

```tsx
import { Analytics } from '@/components/analytics'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // ... mevcut kod ...
  
  return (
    <html lang="tr" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Analytics />
        {children}
      </body>
    </html>
  )
}
```

---

## 4. E-commerce Tracking Kullanımı

### Sepete Ekleme:

```tsx
import { trackAddToCart } from '@/lib/analytics'

const handleAddToCart = (product) => {
  // Sepete ekle
  addToCart(product)
  
  // Analytics'e gönder
  trackAddToCart({
    item_id: product.id,
    item_name: product.name,
    price: product.price,
    quantity: 1,
  })
}
```

### Checkout Başlatma:

```tsx
import { trackBeginCheckout } from '@/lib/analytics'

const handleCheckout = () => {
  const items = cart.items.map(item => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))
  
  trackBeginCheckout(items, cart.total)
}
```

### Satın Alma:

```tsx
import { trackPurchase } from '@/lib/analytics'

// Success sayfasında
trackPurchase(orderId, totalAmount, items)
```

---

## 5. Özel Event Tracking

```tsx
import { event } from '@/lib/analytics'

// Örnek: Ürün detay görüntüleme
event({
  action: 'view_item',
  category: 'engagement',
  label: productName,
  value: productPrice,
})

// Örnek: İletişim formu gönderimi
event({
  action: 'contact_form_submit',
  category: 'lead',
  label: 'contact_page',
})
```

---

## 6. Test Edin

1. `npm run dev` ile local'de çalıştırın
2. Chrome DevTools > Network sekmesini açın
3. `gtag/js` isteklerini görmelisiniz
4. Google Analytics Real-Time raporlarını kontrol edin

---

## 7. Production'da Doğrulama

1. Site'yi ziyaret edin
2. Google Analytics > Real-Time > Overview
3. Aktif kullanıcıları görmelisiniz
4. Sayfa görüntülemelerini kontrol edin

---

## 📝 Notlar

- Analytics sadece `NEXT_PUBLIC_GA_MEASUREMENT_ID` tanımlıysa aktif olur
- Development'ta console'da event'leri görebilirsiniz
- Production'da gerçek zamanlı tracking çalışır
- E-commerce tracking otomatik olarak Enhanced E-commerce kullanır

---

## 🔒 Gizlilik

- KVKK uyumluluğu için cookie consent banner ekleyin
- Gizlilik politikasında Google Analytics kullanımını belirtin
- IP anonimleştirme otomatik olarak aktiftir (GA4)

---

**Oluşturulma**: 2026-03-30  
**Durum**: Hazır (Environment variable eklenmeli)
