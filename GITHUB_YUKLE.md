# 📤 GitHub'a Yükleme Rehberi

## Adım 1: GitHub'da Yeni Repository Oluşturun

1. https://github.com/new adresine gidin
2. Repository name: `bs3dcrafts`
3. Description: `3D Printing E-Commerce Platform`
4. Public veya Private seçin
5. **ÖNEMLİ**: "Add a README file" seçmeyin (boş bırakın)
6. "Create repository" butonuna tıklayın

## Adım 2: Repository URL'sini Kopyalayın

GitHub yeni repository sayfasında size komutlar gösterecek.
HTTPS URL'sini kopyalayın, örnek:
```
https://github.com/USERNAME/bs3dcrafts.git
```

## Adım 3: Terminal'de Komutları Çalıştırın

Aşağıdaki komutları çalıştırın (URL'yi kendi URL'nizle değiştirin):

```bash
cd "C:\Users\berki\Desktop\3D YAZICI E TİCARET SİTESİ\bs3dcrafts"
git remote add origin https://github.com/USERNAME/bs3dcrafts.git
git branch -M main
git push -u origin main
```

## Adım 4: GitHub Kimlik Doğrulama

Push yaparken GitHub kullanıcı adı ve şifre isteyecek:
- Username: GitHub kullanıcı adınız
- Password: Personal Access Token (PAT) kullanın

### Personal Access Token Oluşturma:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Note: "bs3dcrafts-deploy"
4. Expiration: 90 days
5. Scopes: `repo` seçin (tüm repo yetkilerini verir)
6. "Generate token" butonuna tıklayın
7. Token'ı kopyalayın (bir daha göremezsiniz!)
8. Push yaparken şifre yerine bu token'ı kullanın

## Tamamlandı!

Push başarılı olduktan sonra:
- GitHub repository'niz güncellenecek
- Vercel otomatik deploy edecek (eğer bağlıysa)
