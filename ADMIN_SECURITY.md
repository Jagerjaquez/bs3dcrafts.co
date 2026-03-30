# Admin Güvenlik Sistemi

## Genel Bakış

BS3DCrafts admin paneli, çok katmanlı güvenlik sistemi ile korunmaktadır.

## Güvenlik Özellikleri

### ✅ 1. Gelişmiş Session Yönetimi

**Özellikler**:
- Session expiration (8 saat)
- Otomatik session refresh (1 saat kala)
- Activity tracking
- IP ve User-Agent logging

**Dosya**: `lib/session.ts`

**Kullanım**:
```typescript
// Session oluşturma
await createSession('admin', ipAddress, userAgent)

// Session doğrulama
const session = await validateSession()

// Session yenileme
await refreshSession()

// Session sonlandırma
await destroySession()
```

### ✅ 2. CSRF Koruması

**Özellikler**:
- Cryptographically secure token generation
- Token validation for state-changing operations
- Constant-time comparison (timing attack prevention)

**Dosya**: `lib/csrf.ts`

**Kullanım**:
```typescript
// Token oluşturma (login'de)
const csrfToken = await setCSRFToken()

// Token doğrulama (POST/PUT/DELETE'de)
const csrfError = await requireCSRFToken(request)
if (csrfError) return csrfError
```

**Client-side kullanım**:
```typescript
// Login sonrası token'ı sakla
const { csrfToken } = await loginResponse.json()
localStorage.setItem('csrfToken', csrfToken)

// Her state-changing request'te header ekle
fetch('/api/admin/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': localStorage.getItem('csrfToken'),
  },
  body: JSON.stringify(data),
})
```

### ✅ 3. Audit Logging

**Özellikler**:
- Tüm admin aksiyonları loglanır
- IP adresi ve User-Agent tracking
- Failed login attempt tracking
- Başarılı/başarısız işlem kaydı

**Dosya**: `lib/audit-log.ts`

**Loglanan Aksiyonlar**:
- `admin_login` - Başarılı giriş
- `admin_logout` - Çıkış
- `admin_login_failed` - Başarısız giriş denemesi
- `product_created` - Ürün oluşturma
- `product_updated` - Ürün güncelleme
- `product_deleted` - Ürün silme
- `order_status_changed` - Sipariş durumu değişikliği
- `order_viewed` - Sipariş görüntüleme
- `settings_changed` - Ayar değişikliği

**Kullanım**:
```typescript
logAudit({
  action: 'product_created',
  userId: 'admin',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
  details: { productId: '123', productName: 'Test Product' },
})
```

**Log görüntüleme**:
```typescript
// Son 100 log
const logs = getAuditLogs({ limit: 100 })

// Belirli bir kullanıcının logları
const userLogs = getAuditLogs({ userId: 'admin' })

// Belirli bir aksiyonun logları
const loginLogs = getAuditLogs({ action: 'admin_login' })

// Tarih aralığı
const recentLogs = getAuditLogs({
  startDate: new Date('2026-03-01'),
  endDate: new Date('2026-03-31'),
})
```

### ✅ 4. Brute Force Koruması

**Özellikler**:
- IP bazlı rate limiting
- 15 dakikada maksimum 5 başarısız deneme
- Otomatik lockout
- Audit log entegrasyonu

**Dosya**: `lib/admin-auth.ts`

**Ayarlar**:
```typescript
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15
```

### ✅ 5. Timing Attack Koruması

**Özellikler**:
- Constant-time string comparison
- Password validation için `crypto.timingSafeEqual()`
- CSRF token validation için constant-time comparison

**Örnek**:
```typescript
// ❌ Güvensiz (timing attack'a açık)
if (password === ADMIN_SECRET) { ... }

// ✅ Güvenli (constant-time)
const isValid = crypto.timingSafeEqual(
  Buffer.from(password),
  Buffer.from(ADMIN_SECRET)
)
```

---

## Kurulum

### 1. Environment Variables

`.env` dosyasına ekleyin:

```env
# Admin Secret (min 32 karakter)
ADMIN_SECRET=your-very-secure-random-password-here-min-32-chars

# Production'da mutlaka değiştirin!
```

**Güçlü şifre oluşturma**:

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Client-side Entegrasyon

Admin login component'ini güncelleyin:

```typescript
// app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Giriş başarısız')
        return
      }

      // CSRF token'ı sakla
      if (data.csrfToken) {
        localStorage.setItem('csrfToken', data.csrfToken)
      }

      router.push('/admin')
    } catch (err) {
      setError('Bir hata oluştu')
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin Şifresi"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Giriş Yap</button>
    </form>
  )
}
```

### 3. API Request Helper

CSRF token'ı otomatik ekleyen helper:

```typescript
// lib/admin-api.ts
export async function adminFetch(url: string, options: RequestInit = {}) {
  const csrfToken = localStorage.getItem('csrfToken')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  // State-changing operations için CSRF token ekle
  if (options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method)) {
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  })
  
  // CSRF token hatası varsa, yeniden login yönlendir
  if (response.status === 403) {
    const data = await response.json()
    if (data.code === 'CSRF_TOKEN_INVALID') {
      localStorage.removeItem('csrfToken')
      window.location.href = '/admin/login'
    }
  }
  
  return response
}

// Kullanım
await adminFetch('/api/admin/products', {
  method: 'POST',
  body: JSON.stringify(productData),
})
```

---

## API Endpoint'leri Güvenleme

### Örnek: Product Update

```typescript
// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { requireCSRFToken } from '@/lib/csrf'
import { logAudit } from '@/lib/audit-log'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // 2. CSRF protection
    const csrfError = await requireCSRFToken(request)
    if (csrfError) return csrfError

    // 3. Business logic
    const body = await request.json()
    const product = await prisma.product.update({
      where: { id: params.id },
      data: body,
    })

    // 4. Audit logging
    logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: true,
      details: { productId: params.id, changes: body },
    })

    return NextResponse.json(product)
  } catch (error) {
    // 5. Error logging
    logAudit({
      action: 'product_updated',
      userId: 'admin',
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      { error: 'Güncelleme başarısız' },
      { status: 500 }
    )
  }
}
```

---

## Monitoring

### Audit Log Görüntüleme API'si

```typescript
// app/api/admin/audit-logs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/admin-auth'
import { getAuditLogs } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '100')
  const action = searchParams.get('action')

  const logs = getAuditLogs({
    limit,
    action: action as any,
  })

  return NextResponse.json(logs)
}
```

### Failed Login Monitoring

```typescript
// Başarısız giriş denemelerini kontrol et
import { getFailedLoginAttempts } from '@/lib/audit-log'

const failedAttempts = getFailedLoginAttempts('192.168.1.1', 15)
console.log(`Failed attempts: ${failedAttempts}`)
```

---

## Production Checklist

- [ ] Güçlü ADMIN_SECRET oluşturuldu (min 32 karakter)
- [ ] HTTPS aktif (production'da zorunlu)
- [ ] CSRF token client-side entegrasyonu yapıldı
- [ ] Tüm admin API'ler `requireAdminAuth` kullanıyor
- [ ] State-changing API'ler `requireCSRFToken` kullanıyor
- [ ] Audit logging tüm kritik aksiyonlarda aktif
- [ ] Session timeout test edildi
- [ ] Brute force koruması test edildi
- [ ] Audit log görüntüleme paneli eklendi
- [ ] Production'da audit loglar database'e kaydediliyor

---

## Gelecek İyileştirmeler

- [ ] 2FA (Two-Factor Authentication)
- [ ] Multiple admin users
- [ ] Role-based access control (RBAC)
- [ ] Audit log database storage
- [ ] Real-time security alerts
- [ ] IP whitelist/blacklist
- [ ] Session management dashboard
- [ ] Automated security reports

---

## Güvenlik Best Practices

1. **ADMIN_SECRET**:
   - Minimum 32 karakter
   - Rastgele oluşturulmuş
   - Asla git'e commit edilmemeli
   - Düzenli olarak değiştirilmeli (3-6 ayda bir)

2. **HTTPS**:
   - Production'da zorunlu
   - Tüm cookie'ler `secure` flag ile

3. **Session**:
   - Makul expiration süresi (8 saat)
   - Otomatik refresh
   - Logout sonrası temizlik

4. **CSRF**:
   - Tüm state-changing operations'da zorunlu
   - Token rotation düşünülebilir

5. **Audit Logging**:
   - Production'da database'e kaydet
   - Düzenli backup
   - Retention policy (90 gün)

6. **Monitoring**:
   - Failed login attempts izle
   - Suspicious activity alerts
   - Regular security audits

---

## Destek

Güvenlik sorunları için: security@bs3dcrafts.com
