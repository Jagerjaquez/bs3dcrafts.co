# Kullanıcı Hesapları Sistemi

## Genel Bakış

BS3DCrafts platformu artık müşteri hesapları destekliyor. Kullanıcılar kayıt olabilir, giriş yapabilir ve sipariş geçmişlerini görüntüleyebilir.

## Özellikler

✅ Kullanıcı kaydı (email + şifre)  
✅ Güvenli giriş (JWT token)  
✅ Sipariş geçmişi  
✅ Adres defteri  
✅ Profil yönetimi  
✅ Misafir checkout (opsiyonel)

---

## Database Schema

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  emailVerified Boolean   @default(false)
  orders        Order[]
  addresses     Address[]
}
```

### Address Model

```prisma
model Address {
  id         String   @id @default(cuid())
  userId     String
  name       String   // "Home", "Work", etc.
  line1      String
  line2      String?
  city       String
  state      String
  postalCode String
  country    String   @default("Turkey")
  isDefault  Boolean  @default(false)
  user       User     @relation(...)
}
```

### Order Model (Güncellendi)

```prisma
model Order {
  id              String      @id @default(cuid())
  userId          String?     // Optional: for guest checkout
  customerName    String
  email           String
  phone           String
  address         String
  totalAmount     Float
  status          String
  stripePaymentId String?
  trackingNumber  String?     // Yeni: Kargo takip
  user            User?       @relation(...)
  items           OrderItem[]
}
```

---

## Migration

Database schema'yı güncellemek için:

```bash
# Development
npx prisma migrate dev --name add_user_accounts

# Production
npx prisma migrate deploy
```

---

## API Endpoints

### Authentication

#### POST /api/auth/register
Yeni kullanıcı kaydı

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "Ahmet Yılmaz",
  "phone": "+90 555 123 4567"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Ahmet Yılmaz",
    "phone": "+90 555 123 4567"
  }
}
```

#### POST /api/auth/login
Kullanıcı girişi

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Ahmet Yılmaz"
  }
}
```

#### POST /api/auth/logout
Çıkış

**Response**:
```json
{
  "success": true
}
```

#### GET /api/auth/me
Mevcut kullanıcı bilgisi

**Response**:
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Ahmet Yılmaz",
    "phone": "+90 555 123 4567",
    "emailVerified": false,
    "createdAt": "2026-03-30T..."
  }
}
```

### User Orders

#### GET /api/user/orders
Kullanıcının siparişleri

**Response**:
```json
{
  "orders": [
    {
      "id": "clx...",
      "customerName": "Ahmet Yılmaz",
      "totalAmount": 299.99,
      "status": "paid",
      "trackingNumber": "1Z999AA10123456784",
      "createdAt": "2026-03-30T...",
      "items": [
        {
          "id": "clx...",
          "quantity": 1,
          "unitPrice": 299.99,
          "product": {
            "id": "clx...",
            "name": "3D Printed Vase",
            "slug": "3d-printed-vase",
            "media": [...]
          }
        }
      ]
    }
  ]
}
```

#### GET /api/user/orders/[id]
Sipariş detayı

**Response**:
```json
{
  "order": {
    "id": "clx...",
    "customerName": "Ahmet Yılmaz",
    "email": "user@example.com",
    "phone": "+90 555 123 4567",
    "address": "...",
    "totalAmount": 299.99,
    "status": "shipped",
    "trackingNumber": "1Z999AA10123456784",
    "createdAt": "2026-03-30T...",
    "items": [...]
  }
}
```

### User Addresses

#### GET /api/user/addresses
Kullanıcının adresleri

**Response**:
```json
{
  "addresses": [
    {
      "id": "clx...",
      "name": "Home",
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "Istanbul",
      "state": "Istanbul",
      "postalCode": "34000",
      "country": "Turkey",
      "isDefault": true
    }
  ]
}
```

#### POST /api/user/addresses
Yeni adres ekle

**Request**:
```json
{
  "name": "Work",
  "line1": "456 Business Ave",
  "city": "Istanbul",
  "state": "Istanbul",
  "postalCode": "34100",
  "country": "Turkey",
  "isDefault": false
}
```

---

## Client-side Kullanım

### React Hook Örneği

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const register = async (userData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    const data = await res.json()
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return { user, loading, login, register, logout }
}
```

### Login Component Örneği

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      router.push('/account')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Giriş Yap</button>
    </form>
  )
}
```

---

## Güvenlik

### Password Hashing
- bcryptjs kullanılıyor
- Salt rounds: 10
- Şifreler asla plain text olarak saklanmaz

### JWT Tokens
- HttpOnly cookie
- 7 gün expiration
- Secure flag (production'da)
- SameSite: lax

### Environment Variables

`.env` dosyasına ekleyin:

```env
# JWT Secret (min 32 karakter)
JWT_SECRET=your-very-secure-random-jwt-secret-min-32-chars

# Production'da mutlaka değiştirin!
```

**Güçlü JWT secret oluşturma**:

```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

---

## Misafir Checkout

Kullanıcılar hesap oluşturmadan da sipariş verebilir:

```typescript
// Order'da userId opsiyonel
const order = await prisma.order.create({
  data: {
    userId: user?.id, // null olabilir
    customerName: 'Guest User',
    email: 'guest@example.com',
    // ...
  },
})
```

Misafir siparişleri email ile eşleştirilebilir:

```typescript
// Kullanıcı kayıt olduğunda, eski siparişlerini bağla
await prisma.order.updateMany({
  where: {
    email: user.email,
    userId: null,
  },
  data: {
    userId: user.id,
  },
})
```

---

## Email Verification (Gelecek)

Email doğrulama özelliği eklenebilir:

1. Kayıt sonrası doğrulama emaili gönder
2. Token ile doğrulama linki
3. `emailVerified` flag'i güncelle

---

## Production Checklist

- [ ] Database migration yapıldı
- [ ] JWT_SECRET ayarlandı (32+ karakter)
- [ ] Password validation kuralları belirlendi
- [ ] Rate limiting eklendi (brute force koruması)
- [ ] Email verification planlandı
- [ ] Password reset özelliği eklendi
- [ ] Account deletion özelliği eklendi
- [ ] GDPR compliance kontrol edildi

---

## Gelecek İyileştirmeler

- [ ] Email verification
- [ ] Password reset
- [ ] Social login (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Account deletion
- [ ] Profile photo upload
- [ ] Wishlist/favorites
- [ ] Order notifications (email)
- [ ] Loyalty points system

---

## Destek

Kullanıcı hesapları ile ilgili sorular için: support@bs3dcrafts.com
