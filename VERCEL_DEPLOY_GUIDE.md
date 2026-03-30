# 🚀 Vercel CLI ile Deploy

Vercel CLI yüklü, direkt deploy edebilirsiniz!

## Adım 1: Environment Variables Ekle

Önce Vercel'e bu 2 değişkeni ekleyin:

1. https://vercel.com → Projeniz → Settings → Environment Variables
2. Ekleyin:

```
JWT_SECRET=Xk9mP2vL8nQ4wR7tY6uI3oP5aS1dF0gH9jK2lZ4xC8vB6nM3qW5eR7tY9uI1oP3a
NEXT_PUBLIC_BASE_URL=https://bs3dcrafts.vercel.app
```

## Adım 2: Deploy Komutu

Terminal'de şu komutu çalıştırın:

```bash
cd "C:\Users\berki\Desktop\3D YAZICI E TİCARET SİTESİ\bs3dcrafts"
vercel --prod
```

Bu komut:
- Tüm dosyaları Vercel'e yükleyecek
- Production build yapacak
- Deploy edecek

## Adım 3: Test

Deploy tamamlandıktan sonra:
- https://bs3dcrafts.vercel.app/register
- https://bs3dcrafts.vercel.app/login
- https://bs3dcrafts.vercel.app/account

Test edin!
