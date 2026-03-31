# Sentry'de Doğru Projeyi Seçme

## 🎯 Sorun

Sentry Dashboard'da "Set up the Sentry SDK" mesajı görüyorsunuz. Bu, yanlış projeye baktığınız anlamına gelir.

## 🔍 DSN Analizi

Sizin DSN'iniz:
```
https://a66b481c37410a1665df50c0c0e35201@o4511138756165632.ingest.de.sentry.io/4511138781921360
```

Bu DSN'deki proje ID: **4511138781921360**

## ✅ Çözüm

### Adım 1: Proje Seçiciyi Açın

Sentry Dashboard'da **sol üst köşede** proje adı yazıyor. Ona tıklayın.

### Adım 2: Tüm Projeleri Görün

Açılan menüde tüm projelerinizi göreceksiniz:
- bs3dcrafts
- next-js
- (diğer projeler varsa)

### Adım 3: Doğru Projeyi Seçin

DSN'inizin hangi projeye ait olduğunu bulmak için:

1. **Her projeye tıklayın**
2. **Settings** > **Projects** > **[Proje Adı]** > **Client Keys (DSN)**
3. DSN'i kontrol edin
4. Eşleşen projeyi bulun

### Adım 4: Direkt Link

Veya direkt şu link'i deneyin:

**Issues sayfası**:
```
https://sentry.io/organizations/bs3dcraftsco/issues/
```

**Discover sayfası**:
```
https://sentry.io/organizations/bs3dcraftsco/discover/homepage/
```

## 🔄 Alternatif: Yeni Proje Oluşturun

Eğer karışıklık varsa, yeni bir proje oluşturalım:

### 1. Yeni Proje Oluştur

1. Sentry Dashboard'da sağ üstte **"Create Project"** butonuna tıklayın
2. Platform: **"Next.js"** seçin
3. Proje adı: **"bs3dcrafts-production"** yazın
4. Team: Default team'i seçin
5. **"Create Project"** butonuna tıklayın

### 2. Yeni DSN'i Kopyalayın

Proje oluşturulduktan sonra DSN gösterilecek:
```
https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

### 3. DSN'i Güncelleyin

#### Local (.env)
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

#### Vercel
```bash
vercel env rm NEXT_PUBLIC_SENTRY_DSN production
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Yeni DSN'i girin
```

### 4. Redeploy

```bash
git add .
git commit -m "update: Sentry DSN"
git push origin main
```

## 🧪 Test

Yeni proje ile test edin:
```
https://bs3dcrafts.vercel.app/api/test-sentry
```

Sonra yeni projede Issues sekmesini kontrol edin.

## 📊 Mevcut Durumu Kontrol

Şu anda hangi projede olduğunuzu görmek için:

1. Sentry Dashboard'da **sol üst köşeye** bakın
2. Proje adı ne yazıyor?
   - "next-js" → Yanlış proje, değiştirin
   - "bs3dcrafts" → Doğru proje, ama event'ler gelmemiş olabilir

## 🔍 Event'leri Bulma

Eğer doğru projedeyseniz ama event göremiyorsanız:

### Discover Sayfasına Gidin

1. Sol menüden **"Discover"** sekmesine tıklayın
2. Şu query'yi çalıştırın:
   ```
   event.type:error OR event.type:message
   ```
3. Time range: **"Last 7 days"**
4. Burada tüm event'leri göreceksiniz

### Stats Sayfasına Gidin

1. Sol menüden **"Stats"** sekmesine tıklayın
2. Burada proje istatistiklerini göreceksiniz:
   - Total events
   - Errors
   - Transactions
3. Eğer "0 events" yazıyorsa, event'ler gelmemiş demektir

## 🚨 Event'ler Gelmiyorsa

### 1. DSN Doğru mu Kontrol Edin

Vercel'de:
```bash
vercel env pull .env.vercel
```

Sonra `.env.vercel` dosyasını açın ve DSN'i kontrol edin.

### 2. Build Log'larını Kontrol Edin

Vercel Dashboard > Deployments > Son deployment > Build Logs

Şu satırları arayın:
```
Sentry webpack plugin
Uploading source maps
```

### 3. Runtime Log'larını Kontrol Edin

Vercel Dashboard > Deployments > Son deployment > Functions

`/api/test-sentry` fonksiyonunun log'larına bakın.

### 4. Browser Console'u Kontrol Edin

Tarayıcıda:
1. F12 ile Developer Tools'u açın
2. Console sekmesine gidin
3. https://bs3dcrafts.vercel.app/api/test-sentry sayfasını açın
4. Herhangi bir Sentry hatası var mı?

## ✅ Başarı Kriterleri

Sentry doğru çalışıyorsa:

1. **Stats sayfasında**:
   - Events > 0
   - Errors > 0

2. **Issues sayfasında**:
   - En az 1 issue görünüyor
   - "Test error from Sentry" başlıklı issue var

3. **Discover sayfasında**:
   - Event listesi dolu
   - Son 24 saatte event'ler var

## 📞 Destek

Hala sorun varsa:

1. **Ekran görüntüsü paylaşın**:
   - Sentry Dashboard (sol üst köşe dahil)
   - Issues sayfası
   - Stats sayfası

2. **Log'ları paylaşın**:
   - Vercel build logs
   - Vercel function logs
   - Browser console

3. **DSN'i kontrol edin**:
   - Local .env
   - Vercel environment variables
   - Sentry project settings

---

**Önemli**: Sentry'de birden fazla proje varsa, doğru projeyi seçtiğinizden emin olun!
