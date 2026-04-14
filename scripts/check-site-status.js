#!/usr/bin/env node

/**
 * Site Status Checker
 * Tests both domains to see current status
 */

const https = require('https');
const http = require('http');

console.log('🔍 SİTE DURUM KONTROLÜ');
console.log('=====================');
console.log('');

const urls = [
  'https://bs3dcrafts.com',
  'https://bs3dcrafts-co.vercel.app',
  'https://bs3dcrafts.com/api/health',
  'https://bs3dcrafts-co.vercel.app/api/health'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        headers: res.headers
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        error: err.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout'
      });
    });
  });
}

async function checkAllUrls() {
  console.log('📡 URL\'ler test ediliyor...');
  console.log('');
  
  for (const url of urls) {
    const result = await checkUrl(url);
    
    const status = result.success ? '✅' : '❌';
    const statusText = result.status === 'ERROR' ? 'HATA' : 
                      result.status === 'TIMEOUT' ? 'ZAMAN AŞIMI' : 
                      result.status;
    
    console.log(`${status} ${url}`);
    console.log(`   Durum: ${statusText}`);
    
    if (result.error) {
      console.log(`   Hata: ${result.error}`);
    }
    
    if (result.headers && result.headers.location) {
      console.log(`   Yönlendirme: ${result.headers.location}`);
    }
    
    console.log('');
  }
  
  console.log('📋 SONUÇ:');
  console.log('');
  
  const mainDomain = await checkUrl('https://bs3dcrafts.com');
  const backupDomain = await checkUrl('https://bs3dcrafts-co.vercel.app');
  
  if (mainDomain.success) {
    console.log('🎉 ANA DOMAIN ÇALIŞIYOR!');
    console.log('   → https://bs3dcrafts.com kullanabilirsiniz');
  } else if (backupDomain.success) {
    console.log('⚠️  ANA DOMAIN ÇALIŞMIYOR, YEDEK DOMAIN ÇALIŞIYOR');
    console.log('   → https://bs3dcrafts-co.vercel.app kullanın');
    console.log('   → Vercel dashboard\'da domain ayarlarını kontrol edin');
  } else {
    console.log('🚨 HER İKİ DOMAIN DA ÇALIŞMIYOR!');
    console.log('   → Vercel dashboard\'ı kontrol edin');
    console.log('   → Deployment loglarını inceleyin');
  }
}

checkAllUrls().catch(console.error);