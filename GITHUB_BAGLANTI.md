# 🔗 GitHub Repository Bağlantısı

## Adım 1: GitHub Repository URL'nizi Bulun

### Vercel'den Öğrenin:
1. https://vercel.com adresine gidin
2. bs3dcrafts projenizi seçin
3. Settings > Git
4. "Connected Git Repository" altında URL'yi göreceksiniz
5. Örnek: `https://github.com/USERNAME/bs3dcrafts`

### VEYA GitHub'dan Öğrenin:
1. https://github.com adresine gidin
2. bs3dcrafts repository'nizi bulun
3. Yeşil "Code" butonuna tıklayın
4. HTTPS URL'yi kopyalayın

## Adım 2: Remote Ekleyin

Terminal'de şu komutu çalıştırın (URL'yi kendi URL'nizle değiştirin):

```bash
cd "C:\Users\berki\Desktop\3D YAZICI E TİCARET SİTESİ\bs3dcrafts"
git remote add origin https://github.com/USERNAME/bs3dcrafts.git
git branch -M main
git push -u origin main
```

## Adım 3: Push Yapın

Eğer repository zaten varsa ve conflict olursa:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## Sorun Giderme

### "Repository not found" hatası:
- URL'yi kontrol edin
- GitHub'da repository var mı kontrol edin
- GitHub hesabınıza giriş yaptınız mı?

### "Permission denied" hatası:
- GitHub hesabınıza giriş yapın
- Personal Access Token oluşturun
- Token'ı şifre olarak kullanın
