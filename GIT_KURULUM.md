# 🔧 Git Kurulum Rehberi

## Seçenek A: Git for Windows (Önerilen)

1. **İndir**: https://git-scm.com/download/win
2. **Kur**: Varsayılan ayarlarla devam et
3. **Terminal'i yeniden başlat**
4. **Test et**: `git --version`

## Seçenek B: GitHub Desktop (Daha Kolay)

1. **İndir**: https://desktop.github.com
2. **Kur**: Çift tıkla ve kur
3. **GitHub hesabınla giriş yap**
4. **Repository ekle**: File > Add Local Repository
5. **Klasörü seç**: `C:\Users\berki\Desktop\3D YAZICI E TİCARET SİTESİ\bs3dcrafts`

## Kurulum Sonrası

Git kurduktan sonra:

```bash
cd "C:\Users\berki\Desktop\3D YAZICI E TİCARET SİTESİ\bs3dcrafts"
git add .
git commit -m "feat: complete user system - production ready"
git push origin main
```

Vercel otomatik deploy edecek!
