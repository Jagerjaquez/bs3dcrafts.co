# Hero Arka Plan Görseli Ekleme Rehberi

Ana sayfadaki "Her Katmanda Mükemmellik" bölümüne arka plan görseli ve ürün görselleri eklemek için:

## Adım 1: Görsel Hazırlama

### Ana Arka Plan Görseli
Önerilen görsel özellikleri:
- **Boyut**: 1920x1080 veya daha büyük (Full HD+)
- **Format**: JPG, PNG veya WebP
- **Konu**: 3D yazıcı, 3D baskı ürünleri, teknoloji temalı
- **Kalite**: Yüksek çözünürlük

### Ürün Görselleri (4 adet)
Blurlu arka plan için:
- **Boyut**: 500x500 veya daha büyük
- **Format**: JPG, PNG veya WebP
- **Konu**: En popüler 4 ürününüz
- **Not**: Görseller blur efekti ile gösterileceği için detay önemli değil

## Adım 2: Görselleri Projeye Ekleme

1. Görsellerinizi `bs3dcrafts/public/` klasörüne kopyalayın
2. Ana arka plan görselini `hero-bg.jpg` olarak adlandırın
3. Ürün görsellerini şu şekilde adlandırın:
   - `product1.jpg`
   - `product2.jpg`
   - `product3.jpg`
   - `product4.jpg`

Örnek:
```
bs3dcrafts/public/hero-bg.jpg
bs3dcrafts/public/product1.jpg
bs3dcrafts/public/product2.jpg
bs3dcrafts/public/product3.jpg
bs3dcrafts/public/product4.jpg
```

## Adım 3: Ürün Görsellerini Aktif Etme

`bs3dcrafts/app/page.tsx` dosyasında şu satırları bulun ve yorum satırlarını kaldırın:

```tsx
{/* Replace with actual product image: <Image src="/product1.jpg" alt="" fill className="object-cover" /> */}
```

Şu şekilde değiştirin:

```tsx
<Image src="/product1.jpg" alt="Product 1" fill className="object-cover" />
```

Aynı işlemi 4 ürün görseli için de yapın (product1, product2, product3, product4).

## Adım 4: Farklı İsim Kullanıyorsanız

Eğer görselleri farklı isimlerle kaydettiyseniz, `bs3dcrafts/app/page.tsx` dosyasında ilgili satırları güncelleyin.

```tsx
<div className="w-full h-full bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
```

Ve `/hero-bg.jpg` kısmını kendi görsel adınızla değiştirin:

```tsx
<div className="w-full h-full bg-[url('/sizin-gorsel-adiniz.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
```

## Adım 4: Opacity (Saydamlık) Ayarlama

Görselin saydamlığını ayarlamak için `opacity-30` değerini değiştirebilirsiniz:

- `opacity-10` - Çok hafif (10%)
- `opacity-20` - Hafif (20%)
- `opacity-30` - Orta (30%) - **Varsayılan**
- `opacity-40` - Belirgin (40%)
- `opacity-50` - Yarı saydam (50%)

## Adım 5: Gradient Overlay Ayarlama

Görselin üzerindeki koyu katmanı ayarlamak için:

```tsx
<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10" />
```

Değerleri değiştirebilirsiniz:
- `from-black/70` - Üst kısım (70% koyu)
- `via-black/50` - Orta kısım (50% koyu)
- `to-black/70` - Alt kısım (70% koyu)

## Alternatif: Next.js Image Component Kullanımı

Daha iyi performans için Next.js Image component'ini kullanabilirsiniz:

1. `bs3dcrafts/app/page.tsx` dosyasında şu satırları bulun:
```tsx
{/* Alternative: If you want to use Next.js Image component */}
{/* <Image 
  src="/hero-bg.jpg" 
  alt="3D Printing Background" 
  fill 
  className="object-cover opacity-30"
  priority
/> */}
```

2. Yorum satırlarını kaldırın ve CSS background satırını yorum satırı yapın:
```tsx
{/* <div className="w-full h-full bg-[url('/hero-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-30" /> */}
<Image 
  src="/hero-bg.jpg" 
  alt="3D Printing Background" 
  fill 
  className="object-cover opacity-30"
  priority
/>
```

## Önerilen Ücretsiz Görsel Kaynakları

- [Unsplash](https://unsplash.com/s/photos/3d-printing)
- [Pexels](https://www.pexels.com/search/3d%20printing/)
- [Pixabay](https://pixabay.com/images/search/3d%20printer/)

## Örnek Arama Terimleri

- "3d printer"
- "3d printing technology"
- "additive manufacturing"
- "3d printed objects"
- "futuristic technology"

---

## Sorun Giderme

### Görsel Görünmüyor
1. Görselin `public` klasöründe olduğundan emin olun
2. Dosya adının doğru yazıldığından emin olun (büyük/küçük harf duyarlı)
3. Tarayıcı cache'ini temizleyin (Ctrl+F5)

### Görsel Çok Koyu/Açık
- `opacity` değerini ayarlayın
- Gradient overlay değerlerini değiştirin

### Görsel Bozuk Görünüyor
- Görselin boyutunun yeterli olduğundan emin olun (min 1920x1080)
- `bg-cover` yerine `bg-contain` deneyin
- `bg-center` yerine `bg-top` veya `bg-bottom` deneyin

---

**Not**: Değişiklikleri yaptıktan sonra development server otomatik olarak yenilenecektir.
