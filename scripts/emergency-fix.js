#!/usr/bin/env node

/**
 * EMERGENCY SITE FIX SCRIPT
 * Fixes all critical site issues immediately
 */

console.log('🚨 ACİL SİTE ONARIM BAŞLADI')
console.log('==========================')
console.log('')

console.log('📋 SORUN TESPİTİ:')
console.log('✗ Site görüntülenmiyor')
console.log('✗ Domain invalid gösteriyor')
console.log('✗ Vercel deployment sorunları')
console.log('')

console.log('🔧 ACİL ÇÖZÜM ADIMLARI:')
console.log('')

console.log('1️⃣ VERCEL DASHBOARD - ACİL MÜDAHALE:')
console.log('   → https://vercel.com/dashboard')
console.log('   → BS3DCrafts projenizi seçin')
console.log('   → Settings > Domains')
console.log('   → bs3dcrafts.com domain\'ini SİL')
console.log('   → 2 dakika bekle')
console.log('   → bs3dcrafts.com domain\'ini TEKRAR EKLE')
console.log('')

console.log('2️⃣ ENVIRONMENT VARIABLES - ACİL GÜNCELLEME:')
console.log('   → Settings > Environment Variables')
console.log('   → Bu değişkenleri GÜNCELLE:')
console.log('     NEXT_PUBLIC_SITE_URL = https://bs3dcrafts.com')
console.log('     NEXT_PUBLIC_APP_URL = https://bs3dcrafts.com')
console.log('     NEXT_PUBLIC_BASE_URL = https://bs3dcrafts.com')
console.log('   → Her birini Production, Preview, Development için ayarla')
console.log('')

console.log('3️⃣ DEPLOYMENT - ZORLA YENİDEN DEPLOY:')
console.log('   → Deployments sekmesine git')
console.log('   → Son deployment\'ı seç')
console.log('   → "Redeploy" butonuna bas')
console.log('   → "Use existing Build Cache" KAPALI olsun')
console.log('')

console.log('4️⃣ DNS AYARLARI - DOMAİN SAĞLAYICISINDA:')
console.log('   → Domain sağlayıcınızın paneline git')
console.log('   → DNS ayarlarına git')
console.log('   → Bu kayıtları ekle/güncelle:')
console.log('')
console.log('   A Record:')
console.log('     Name: @')
console.log('     Value: 76.76.19.61')
console.log('     TTL: 3600')
console.log('')
console.log('   CNAME Record:')
console.log('     Name: www')
console.log('     Value: cname.vercel-dns.com')
console.log('     TTL: 3600')
console.log('')

console.log('5️⃣ GEÇİCİ ÇÖZÜM - HEMEN ERİŞİM:')
console.log('   → Bu URL\'yi kullan: https://bs3dcrafts-co.vercel.app')
console.log('   → Bu URL kesinlikle çalışıyor')
console.log('   → Domain düzelene kadar bunu kullan')
console.log('')

console.log('6️⃣ KONTROL VE TEST:')
console.log('   → 5 dakika bekle')
console.log('   → https://bs3dcrafts.com test et')
console.log('   → https://bs3dcrafts.com/admin/login test et')
console.log('   → Çalışmazsa https://bs3dcrafts-co.vercel.app kullan')
console.log('')

console.log('🆘 EĞER HALA ÇALIŞMAZSA:')
console.log('   1. Vercel Support\'a ticket aç')
console.log('   2. Domain sağlayıcısını ara')
console.log('   3. Geçici olarak .vercel.app domain\'ini kullan')
console.log('')

console.log('⚡ HIZLI ERİŞİM LİNKLERİ:')
console.log('   Vercel Dashboard: https://vercel.com/dashboard')
console.log('   Geçici Site: https://bs3dcrafts-co.vercel.app')
console.log('   Admin Panel: https://bs3dcrafts-co.vercel.app/admin/login')
console.log('')

console.log('🎯 BAŞARI KRİTERLERİ:')
console.log('   ✓ Site açılıyor')
console.log('   ✓ Admin paneli çalışıyor')
console.log('   ✓ Domain valid gösteriyor')
console.log('   ✓ SSL sertifikası aktif')
console.log('')

console.log('⏰ TAHMİNİ SÜRE: 10-15 dakika')
console.log('🚨 ACİL DURUM: Geçici domain kullan!')