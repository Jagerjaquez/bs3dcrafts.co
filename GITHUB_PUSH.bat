@echo off
echo ========================================
echo GITHUB'A YUKLEME
echo ========================================
echo.
echo Once GitHub'da yeni repository olusturun:
echo 1. https://github.com/new adresine gidin
echo 2. Repository name: bs3dcrafts
echo 3. "Add a README file" SECMEYIN (bos birakin)
echo 4. "Create repository" tiklayin
echo.
echo Repository olusturdunuz mu?
pause
echo.

cd /d "%~dp0"

echo ========================================
echo GITHUB REPOSITORY URL'SINI GIRIN
echo ========================================
echo.
echo Ornek: https://github.com/USERNAME/bs3dcrafts.git
echo.
set /p REPO_URL="Repository URL: "
echo.

echo Remote ekleniyor...
git remote add origin %REPO_URL%
echo.

echo Branch main yapiliyor...
git branch -M main
echo.

echo ========================================
echo GITHUB'A PUSH YAPILIYOR...
echo ========================================
echo.
echo NOT: GitHub kullanici adi ve Personal Access Token isteyecek
echo Token olusturmak icin: https://github.com/settings/tokens
echo.
git push -u origin main
echo.

echo ========================================
echo TAMAMLANDI!
echo ========================================
echo.
echo GitHub repository'nizi kontrol edin:
echo %REPO_URL%
echo.
echo Vercel otomatik deploy edecek!
echo.
pause
