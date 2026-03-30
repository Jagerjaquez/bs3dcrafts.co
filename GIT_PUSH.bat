@echo off
echo ========================================
echo GIT REPOSITORY BAGLANIYOR...
echo ========================================
echo.

cd /d "%~dp0"

echo 1. Git repository baslat...
git init
echo.

echo 2. Remote repository ekle...
echo GitHub repository URL'nizi girin (ornek: https://github.com/username/bs3dcrafts.git)
set /p REPO_URL="Repository URL: "
git remote add origin %REPO_URL%
echo.

echo 3. Degisiklikleri ekle...
git add .
echo.

echo 4. Commit yap...
git commit -m "feat: complete user system - production ready"
echo.

echo 5. Push yap...
git branch -M main
git push -u origin main
echo.

echo ========================================
echo GIT PUSH TAMAMLANDI!
echo ========================================
echo.
echo Vercel otomatik deploy edecek!
echo https://vercel.com adresinden takip edin.
echo.
pause
