@echo off
echo ========================================
echo VERCEL DEPLOY BASLIYOR...
echo ========================================
echo.

cd /d "%~dp0"

echo 1. Environment variables kontrol ediliyor...
echo.
echo ONEMLI: Vercel'de su degiskenleri eklediniz mi?
echo - JWT_SECRET
echo - NEXT_PUBLIC_BASE_URL
echo.
echo Eklemediniz mi? Simdi ekleyin:
echo https://vercel.com/[username]/bs3dcrafts/settings/environment-variables
echo.
pause

echo.
echo 2. Vercel'e deploy ediliyor...
echo.
vercel --prod

echo.
echo ========================================
echo DEPLOY TAMAMLANDI!
echo ========================================
echo.
echo Test edin:
echo https://bs3dcrafts.vercel.app/register
echo https://bs3dcrafts.vercel.app/login
echo https://bs3dcrafts.vercel.app/account
echo.
pause
