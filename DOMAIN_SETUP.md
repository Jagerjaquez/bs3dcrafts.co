# 🌐 Domain Kurulumu - BS3CRAFTS.COM

**Tarih**: 31 Mart 2026  
**Domain**: bs3dcrafts.com  
**Sağlayıcı**: Vercel Domains

---

## ✅ Domain Durumu

- **Ana Domain**: bs3dcrafts.com
- **WWW Redirect**: www.bs3dcrafts.com → bs3dcrafts.com
- **SSL Sertifikası**: Otomatik (Let's Encrypt)
- **DNS Yönetimi**: Vercel DNS

---

## 🔧 Vercel Domain Ayarları

### 1. Domain Kontrolü

Vercel Dashboard'da kontrol edin:
```
https://vercel.com/[kullanıcı-adınız]/bs3dcrafts/settings/domains
```

### 2. Beklenen Ayarlar

Domain otomatik olarak şu şekilde yapılandırılmalı:

```
✅ bs3dcrafts.com → Production
✅ www.bs3dcrafts.com → Redirect to bs3dcrafts.com
✅ bs3dcrafts.vercel.app → Production (yedek)
```

### 3. SSL Durumu

SSL sertifikası otomatik oluşturulur:
- Durum: Active
- Sağlayıcı: Let's Encrypt
- Yenileme: Otomatik

---

## 🌍 DNS Propagation

Domain'in dünya çapında yayılması 5-48 saat sürebilir.

### Kontrol Araçları:
- https://dnschecker.org/#A/bs3dcrafts.com
- https://www.whatsmydns.net/#A/bs3dcrafts.com

---

## 📝 Güncellenmesi Gerekenler

### 1. Environment Variables

Vercel'de `NEXT_PUBLIC_SITE_URL` güncellenmeli:

```bash
# Eski
NEXT_PUBLIC_SITE_URL=https://bs3dcrafts.vercel.app

# Yeni
NEXT_PUBLIC_SITE_URL=https://bs3dcrafts.com
```

### 2. Sitemap ve Robots.txt

Otomatik olarak yeni domain'i kullanacak.

### 3. Stripe Webhook URL

Stripe Dashboard'da webhook URL'i güncelleyin:
```
https://bs3dcrafts.com/api/webhooks/stripe
```

### 4. PayTR Callback URL

PayTR panelinde callback URL'i güncelleyin:
```
https://bs3dcrafts.com/api/webhooks/paytr
```

### 5. Sentry DSN

Sentry'de proje URL'i güncellenebilir (opsiyonel).

### 6. Google Analytics / Search Console

- Google Analytics'te property ekleyin
- Google Search Console'a domain ekleyin

---

## 🔗 Yeni URL'ler

### Ana Sayfa
```
https://bs3dcrafts.com
```

### Ürünler
```
https://bs3dcrafts.com/products
```

### Admin Panel
```
https://bs3dcrafts.com/admin
```

### API Endpoints
```
https://bs3dcrafts.com/api/*
```

---

## ✅ Yapılacaklar Listesi

- [ ] Vercel Dashboard'da domain durumunu kontrol et
- [ ] SSL sertifikasının aktif olduğunu doğrula
- [ ] `NEXT_PUBLIC_SITE_URL` environment variable'ı güncelle
- [ ] Stripe webhook URL'i güncelle
- [ ] PayTR callback URL'i güncelle
- [ ] Google Search Console'a domain ekle
- [ ] DNS propagation'ı kontrol et
- [ ] Tüm sayfaların yeni domain'de çalıştığını test et

---

## 🎉 Sonuç

Domain başarıyla alındı! Vercel otomatik olarak:
- DNS ayarlarını yapılandırdı
- SSL sertifikası oluşturdu
- WWW redirect'i ayarladı
- CDN'i yapılandırdı

Şimdi sadece environment variable'ları ve webhook URL'lerini güncellemeniz gerekiyor.
