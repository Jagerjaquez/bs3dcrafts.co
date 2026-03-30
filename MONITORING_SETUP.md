# Monitoring ve Error Tracking Kurulumu

## Genel Bakış

BS3DCrafts platformu, **Sentry** kullanarak kapsamlı error tracking ve performance monitoring sağlar.

## Özellikler

✅ Real-time error tracking  
✅ Performance monitoring  
✅ Business metrics tracking  
✅ Security event tracking  
✅ Session replay (hata durumlarında)  
✅ Release tracking  
✅ User context tracking

---

## Kurulum Adımları

### 1. Sentry Hesabı Oluşturma

1. [Sentry.io](https://sentry.io) adresine gidin
2. Ücretsiz hesap oluşturun
3. "Create Project" butonuna tıklayın
4. Platform: "Next.js" seçin
5. Proje ismi: "bs3dcrafts"
6. DSN'i kopyalayın

### 2. Environment Variables

`.env` dosyasına ekleyin:

```env
# Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Sentry Auth Token (optional, for source maps)
SENTRY_AUTH_TOKEN=xxxxx

# Sentry Organization & Project
SENTRY_ORG=your-org
SENTRY_PROJECT=bs3dcrafts
```

### 3. Vercel Environment Variables

Production deployment için:

1. Vercel Dashboard > Project > Settings > Environment Variables
2. Yukarıdaki değişkenleri ekleyin
3. Environment: "Production", "Preview", "Development"
4. "Save" ve redeploy

---

## Sentry Configuration

### Client-side (sentry.client.config.ts)

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0, // 100% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
  environment: process.env.NODE_ENV,
})
```

### Server-side (sentry.server.config.ts)

```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
    }
    return event
  },
})
```

---

## Kullanım

### Error Tracking

```typescript
import { trackError } from '@/lib/monitoring'

try {
  // Risky operation
  await processPayment()
} catch (error) {
  trackError(error as Error, {
    category: 'payment',
    severity: 'critical',
    metadata: {
      orderId: '123',
      amount: 299.99,
    },
    userId: user.id,
  })
}
```

### Custom Events

```typescript
import { trackEvent } from '@/lib/monitoring'

trackEvent({
  name: 'checkout_completed',
  category: 'business',
  severity: 'low',
  metadata: {
    orderId: '123',
    amount: 299.99,
    paymentMethod: 'stripe',
  },
  userId: user.id,
})
```

### Performance Monitoring

```typescript
import { startTransaction } from '@/lib/monitoring'

const transaction = startTransaction('checkout_process', 'http.server')

try {
  // Your code
  await processCheckout()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}
```

### Business Metrics

```typescript
import { BusinessMetrics } from '@/lib/monitoring'

// Order created
BusinessMetrics.orderCreated('order_123', 299.99)

// Order completed
BusinessMetrics.orderCompleted('order_123', 299.99)

// Product viewed
BusinessMetrics.productViewed('product_456', '3D Printed Vase')

// Cart abandoned
BusinessMetrics.cartAbandoned(299.99, 3)

// Checkout started
BusinessMetrics.checkoutStarted(299.99, 3)

// Payment failed
BusinessMetrics.paymentFailed('order_123', 299.99, 'insufficient_funds')
```

### Security Events

```typescript
import { SecurityEvents } from '@/lib/monitoring'

// Suspicious activity
SecurityEvents.suspiciousActivity('Multiple failed login attempts', {
  ipAddress: '192.168.1.1',
  attempts: 5,
})

// Brute force attempt
SecurityEvents.bruteForceAttempt('192.168.1.1', 10)

// Unauthorized access
SecurityEvents.unauthorizedAccess('/admin/products', '192.168.1.1')

// CSRF violation
SecurityEvents.csrfViolation('192.168.1.1')
```

### User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/monitoring'

// Set user context (after login)
setUserContext({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Clear user context (after logout)
clearUserContext()
```

### Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/monitoring'

addBreadcrumb('User clicked checkout button', 'user.action', 'info', {
  cartValue: 299.99,
  itemCount: 3,
})

addBreadcrumb('Payment processing started', 'payment', 'info', {
  paymentMethod: 'stripe',
})
```

---

## API Endpoint Entegrasyonu

### Örnek: Product API

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { startTransaction, trackError } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  const transaction = startTransaction('GET /api/products')
  
  try {
    const products = await prisma.product.findMany()
    
    transaction.setStatus('ok')
    return NextResponse.json({ products })
  } catch (error) {
    transaction.setStatus('internal_error')
    
    trackError(error as Error, {
      category: 'api',
      severity: 'high',
      metadata: {
        endpoint: '/api/products',
        method: 'GET',
      },
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  } finally {
    transaction.finish()
  }
}
```

---

## Sentry Dashboard

### Issues
- Real-time error tracking
- Stack traces
- User context
- Breadcrumbs
- Release information

### Performance
- Transaction monitoring
- Slow queries
- API response times
- Frontend performance

### Releases
- Deploy tracking
- Error rate per release
- Regression detection

### Alerts
- Email notifications
- Slack integration
- PagerDuty integration
- Custom alert rules

---

## Alert Configuration

### Recommended Alerts

1. **High Error Rate**
   - Condition: >10 errors in 5 minutes
   - Action: Email + Slack notification

2. **Critical Errors**
   - Condition: Any error with severity=critical
   - Action: Immediate notification

3. **Performance Degradation**
   - Condition: P95 response time >3s
   - Action: Email notification

4. **Security Events**
   - Condition: Any security event with severity=high/critical
   - Action: Immediate notification

---

## Source Maps

Source maps'i Sentry'ye yüklemek için:

```bash
# Build sırasında otomatik yüklenir
npm run build

# Manuel yükleme
npx @sentry/cli sourcemaps upload --org=your-org --project=bs3dcrafts ./out
```

`next.config.ts` içinde:

```typescript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  {
    // Next.js config
  },
  {
    // Sentry webpack plugin options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Sentry SDK options
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
)
```

---

## Performance Optimization

### Sample Rates

Development:
```typescript
tracesSampleRate: 1.0 // 100% of transactions
replaysSessionSampleRate: 1.0 // 100% of sessions
```

Production:
```typescript
tracesSampleRate: 0.1 // 10% of transactions
replaysSessionSampleRate: 0.01 // 1% of sessions
replaysOnErrorSampleRate: 1.0 // 100% of error sessions
```

### Filtering

```typescript
beforeSend(event, hint) {
  // Ignore specific errors
  if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
    return null
  }
  
  // Remove sensitive data
  if (event.request) {
    delete event.request.cookies
    delete event.request.headers?.authorization
  }
  
  return event
}
```

---

## Monitoring Best Practices

1. **Error Tracking**:
   - Track all unhandled errors
   - Add context to errors
   - Set appropriate severity levels

2. **Performance**:
   - Monitor critical user flows
   - Track API response times
   - Identify slow queries

3. **Business Metrics**:
   - Track key business events
   - Monitor conversion funnel
   - Identify drop-off points

4. **Security**:
   - Track security events
   - Monitor suspicious activity
   - Alert on critical events

5. **User Context**:
   - Set user context after login
   - Clear context after logout
   - Don't include sensitive data

---

## Troubleshooting

### Sentry Not Receiving Events

1. Check DSN is correct
2. Verify environment variables
3. Check network connectivity
4. Review beforeSend filters

### Too Many Events

1. Adjust sample rates
2. Add filters for common errors
3. Use ignoreErrors configuration

### Missing Source Maps

1. Verify SENTRY_AUTH_TOKEN
2. Check build configuration
3. Ensure source maps are uploaded

---

## Maliyet

**Sentry Pricing**:
- Developer (Free): 5,000 errors/month, 10,000 transactions/month
- Team: $26/month, 50,000 errors/month, 100,000 transactions/month
- Business: $80/month, 150,000 errors/month, 300,000 transactions/month

**Tahmini Kullanım**:
- Küçük site: Free plan yeterli
- Orta site: Team plan
- Büyük site: Business plan

---

## Production Checklist

- [ ] Sentry hesabı oluşturuldu
- [ ] DSN alındı ve ayarlandı
- [ ] Environment variables eklendi
- [ ] Vercel'de env variables ayarlandı
- [ ] Source maps yükleniyor
- [ ] Alert'ler yapılandırıldı
- [ ] Sample rates ayarlandı (production için)
- [ ] Sensitive data filtering aktif
- [ ] Test error gönderildi ve alındı
- [ ] Dashboard kontrol edildi

---

## Test Etme

### Test Error Gönderme

```typescript
// app/api/test-sentry/route.ts
import { NextResponse } from 'next/server'
import { trackError } from '@/lib/monitoring'

export async function GET() {
  try {
    throw new Error('Test error from Sentry')
  } catch (error) {
    trackError(error as Error, {
      category: 'test',
      severity: 'low',
      metadata: { test: true },
    })
  }
  
  return NextResponse.json({ message: 'Test error sent to Sentry' })
}
```

Tarayıcıda: `http://localhost:3000/api/test-sentry`

Sentry Dashboard'da error'u kontrol edin.

---

## Destek

- Sentry Docs: https://docs.sentry.io
- BS3DCrafts Support: support@bs3dcrafts.com
