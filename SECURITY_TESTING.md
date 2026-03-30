# Güvenlik Testi Rehberi

Bu dokümantasyon, BS3DCRAFTS platformunun güvenlik testlerini nasıl çalıştıracağınızı ve manuel güvenlik testlerini nasıl yapacağınızı açıklar.

## Otomatik Güvenlik Testleri

### Tüm Güvenlik Testlerini Çalıştırma

```bash
# Tüm güvenlik testleri
npm test -- __tests__/security/

# Sadece kapsamlı güvenlik testleri
npm test -- __tests__/security/comprehensive-security.test.ts

# Sadece credit card data testleri
npm test -- __tests__/lib/security.test.ts
```

### Spesifik Test Grupları

```bash
# Authentication testleri
npm test -- __tests__/security/comprehensive-security.test.ts -t "Authentication"

# SQL Injection testleri
npm test -- __tests__/security/comprehensive-security.test.ts -t "SQL Injection"

# XSS testleri
npm test -- __tests__/security/comprehensive-security.test.ts -t "XSS"

# Rate Limiting testleri
npm test -- __tests__/security/comprehensive-security.test.ts -t "Rate Limiting"

# Input Validation testleri
npm test -- __tests__/security/comprehensive-security.test.ts -t "Input Validation"

# File Upload testleri
npm test -- __tests__/security/comprehensive-security.test.ts -t "File Upload"
```

## Manuel Güvenlik Testleri

### 1. Admin Authentication Testi

#### Test 1.1: Yetkisiz Admin API Erişimi

```bash
# Ürün oluşturma (yetkisiz)
curl -X POST http://localhost:3000/api/admin/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "price": 100,
    "stock": 10
  }'

# Beklenen Sonuç: 401 Unauthorized
# {
#   "error": "Yetkisiz erişim. Admin girişi gerekli.",
#   "code": "UNAUTHORIZED",
#   "timestamp": "..."
# }
```

#### Test 1.2: Yetkili Admin API Erişimi

```bash
# .env dosyasından ADMIN_SECRET'i alın
export ADMIN_SECRET="your-admin-secret"

# Ürün oluşturma (yetkili)
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "price": 100,
    "stock": 10,
    "description": "Test description",
    "category": "test",
    "material": "PLA",
    "printTimeEstimate": "2 hours",
    "weight": 50
  }'

# Beklenen Sonuç: 201 Created
```

#### Test 1.3: Geçersiz Token

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":100}'

# Beklenen Sonuç: 401 Unauthorized
```

### 2. File Upload Güvenlik Testi

#### Test 2.1: Geçersiz Dosya Tipi

```bash
# Executable dosya yükleme denemesi
echo "malicious code" > malware.exe

curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -F "file=@malware.exe"

# Beklenen Sonuç: 400 Bad Request
# "Geçersiz dosya tipi..."
```

#### Test 2.2: Çok Büyük Dosya

```bash
# 15MB dosya oluştur (limit 10MB)
dd if=/dev/zero of=large.jpg bs=1M count=15

curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -F "file=@large.jpg"

# Beklenen Sonuç: 400 Bad Request
# "Dosya boyutu çok büyük..."
```

#### Test 2.3: Geçerli Dosya

```bash
# Geçerli resim dosyası
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -F "file=@test-image.jpg"

# Beklenen Sonuç: 200 OK
# { "url": "...", "path": "..." }
```

### 3. Rate Limiting Testi

#### Test 3.1: Checkout Rate Limit

```bash
# 11 ardışık istek gönder
for i in {1..11}; do
  echo "Request $i"
  curl -X POST http://localhost:3000/api/checkout/session \
    -H "Content-Type: application/json" \
    -d '{
      "items": [{"id":"1","name":"Test","price":100,"quantity":1}],
      "customerInfo": {
        "name":"Test",
        "email":"test@test.com",
        "phone":"+905551234567",
        "address":"Test"
      }
    }'
  echo ""
done

# Beklenen Sonuç: 
# İlk 10 istek: Normal işlem
# 11. istek: 429 Too Many Requests
```

#### Test 3.2: Rate Limit Reset

```bash
# Rate limit'i test et
for i in {1..11}; do
  curl -s -X POST http://localhost:3000/api/checkout/session > /dev/null
done

# 60 saniye bekle
sleep 60

# Tekrar dene (başarılı olmalı)
curl -X POST http://localhost:3000/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"1","name":"Test","price":100,"quantity":1}],"customerInfo":{"name":"Test","email":"test@test.com","phone":"+905551234567","address":"Test"}}'

# Beklenen Sonuç: Normal işlem
```

### 4. Input Validation Testi

#### Test 4.1: XSS Denemesi

```bash
curl -X POST http://localhost:3000/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id":"1","name":"<script>alert(\"XSS\")</script>","price":100,"quantity":1}],
    "customerInfo": {
      "name":"<img src=x onerror=alert(\"XSS\")>",
      "email":"test@test.com",
      "phone":"+905551234567",
      "address":"Test"
    }
  }'

# Beklenen Sonuç: 400 Bad Request
# "İsim geçersiz karakterler içeriyor"
```

#### Test 4.2: SQL Injection Denemesi

```bash
curl -X POST http://localhost:3000/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id":"1","name":"Test","price":100,"quantity":1}],
    "customerInfo": {
      "name":"'; DROP TABLE orders; --",
      "email":"test@test.com",
      "phone":"+905551234567",
      "address":"Test"
    }
  }'

# Beklenen Sonuç: 400 Bad Request
# "İsim geçersiz karakterler içeriyor"
```

#### Test 4.3: Geçersiz Email

```bash
curl -X POST http://localhost:3000/api/checkout/session \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id":"1","name":"Test","price":100,"quantity":1}],
    "customerInfo": {
      "name":"Test User",
      "email":"not-an-email",
      "phone":"+905551234567",
      "address":"Test"
    }
  }'

# Beklenen Sonuç: 400 Bad Request
# "E-posta adresi geçersiz"
```

#### Test 4.4: Negatif Fiyat

```bash
curl -X POST http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "slug": "test-product",
    "price": -100,
    "stock": 10
  }'

# Beklenen Sonuç: 400 Bad Request
# "Fiyat pozitif bir sayı olmalıdır"
```

#### Test 4.5: Çok Uzun String

```bash
# 10000 karakterlik string oluştur
LONG_STRING=$(python3 -c "print('a' * 10000)")

curl -X POST http://localhost:3000/api/checkout/session \
  -H "Content-Type: application/json" \
  -d "{
    \"items\": [{\"id\":\"1\",\"name\":\"Test\",\"price\":100,\"quantity\":1}],
    \"customerInfo\": {
      \"name\":\"$LONG_STRING\",
      \"email\":\"test@test.com\",
      \"phone\":\"+905551234567\",
      \"address\":\"Test\"
    }
  }"

# Beklenen Sonuç: 400 Bad Request
# "İsim geçersiz veya çok uzun"
```

### 5. Webhook Güvenlik Testi

#### Test 5.1: Stripe Webhook (Geçersiz Signature)

```bash
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid-signature" \
  -d '{
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_fake"
      }
    }
  }'

# Beklenen Sonuç: 400 Bad Request
# Webhook signature verification failed
```

#### Test 5.2: PayTR Webhook (Geçersiz Hash)

```bash
curl -X POST http://localhost:3000/api/webhooks/paytr \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "merchant_oid=ORDER-123&status=success&total_amount=100.00&hash=invalid-hash"

# Beklenen Sonuç: 200 OK (but logged as invalid)
# PayTR webhook'ları her zaman 200 döner ama invalid hash loglanır
```

### 6. HTTPS Enforcement Testi (Production)

```bash
# HTTP ile erişim denemesi (production'da)
curl -I http://yourdomain.com

# Beklenen Sonuç: 301 Redirect to HTTPS
# Location: https://yourdomain.com
```

### 7. Environment Variable Güvenliği

#### Test 7.1: Client-Side'da Sensitive Data Kontrolü

```javascript
// Browser console'da çalıştır
console.log(process.env)

// Beklenen Sonuç: Sadece NEXT_PUBLIC_* değişkenler görünmeli
// STRIPE_SECRET_KEY, ADMIN_SECRET vb. görünmemeli
```

## Güvenlik Test Checklist

### Pre-Production Checklist

- [ ] Tüm otomatik testler geçiyor
- [ ] Admin API'ler authentication gerektiriyor
- [ ] File upload güvenlik kontrolleri aktif
- [ ] Rate limiting çalışıyor
- [ ] Input validation aktif
- [ ] Webhook signature verification çalışıyor
- [ ] HTTPS aktif (production)
- [ ] Environment variables güvenli
- [ ] Error messages detay vermiyor
- [ ] Logging aktif

### Penetration Testing Checklist

- [ ] SQL Injection testleri
- [ ] XSS testleri
- [ ] CSRF testleri
- [ ] Authentication bypass testleri
- [ ] Authorization testleri
- [ ] File upload testleri
- [ ] Rate limiting testleri
- [ ] Session management testleri
- [ ] API security testleri
- [ ] Infrastructure security testleri

## Güvenlik Araçları

### Otomatik Tarama Araçları

```bash
# npm audit - Dependency güvenlik taraması
npm audit

# npm audit fix - Otomatik düzeltme
npm audit fix

# OWASP ZAP - Web application security scanner
# https://www.zaproxy.org/

# Burp Suite - Security testing tool
# https://portswigger.net/burp
```

### Monitoring & Logging

```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log

# Security events
tail -f logs/security.log
```

## Raporlama

### Güvenlik Açığı Bulunursa

1. **Hemen Rapor Edin**
   - Email: security@bs3dcrafts.co
   - Detaylı açıklama
   - Reproduction steps
   - Impact assessment

2. **Bilgi Paylaşımı**
   - Açık: Kritik bilgileri paylaşmayın
   - Kapalı: Sadece güvenlik ekibiyle
   - Responsible disclosure

3. **Takip**
   - 24 saat içinde ilk yanıt
   - 7 gün içinde düzeltme planı
   - 30 gün içinde düzeltme

## Kaynaklar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Sonuç

Düzenli güvenlik testleri yaparak platformunuzun güvenliğini sürekli iyileştirebilirsiniz. Bu testleri:

- Her release öncesi
- Aylık rutin kontroller
- Büyük değişikliklerden sonra
- Güvenlik açığı bildirimi sonrası

çalıştırmanız önerilir.
