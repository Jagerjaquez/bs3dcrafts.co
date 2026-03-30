# Deployment Guide - BS3DCRAFTS

This guide covers production deployment requirements for the BS3DCRAFTS e-commerce platform with Stripe payment integration.

## 🔒 Security Requirements

### HTTPS Configuration (REQUIRED)

**CRITICAL**: The application MUST use HTTPS in production for the following reasons:

1. **Stripe Requirements**: Stripe requires HTTPS for all production payment processing
2. **Webhook Security**: Stripe webhooks must be delivered to HTTPS endpoints
3. **Data Protection**: Customer payment information and personal data must be encrypted in transit
4. **PCI Compliance**: HTTPS is required for PCI DSS compliance

### Environment Variable Configuration

Ensure the following environment variables are properly configured for production:

```env
# Production App URL - MUST use https://
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Stripe Production Keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Important Notes**:
- `NEXT_PUBLIC_APP_URL` MUST start with `https://` in production
- Never use test API keys (`sk_test_`, `pk_test_`) in production
- Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` secure and never commit to version control

## 🚀 Deployment Platforms

### Vercel (Recommended)

Vercel automatically provides HTTPS for all deployments.

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**:
   - Go to Vercel Dashboard > Project Settings > Environment Variables
   - Add all production environment variables
   - Ensure `NEXT_PUBLIC_APP_URL` uses your custom domain with HTTPS

4. **Custom Domain**:
   - Add your custom domain in Vercel Dashboard
   - Vercel automatically provisions SSL certificate
   - Update DNS records as instructed

5. **Stripe Webhook Configuration**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` environment variable

### Netlify

Netlify also provides automatic HTTPS.

1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**:
   - Add all production variables in Netlify Dashboard
   - Ensure `NEXT_PUBLIC_APP_URL` uses HTTPS

3. **SSL Certificate**:
   - Automatically provisioned by Netlify
   - Custom domains supported

### Railway

Railway provides HTTPS for all deployments.

1. **Deploy from GitHub**:
   - Connect your repository
   - Railway auto-detects Next.js

2. **Environment Variables**:
   - Add all production variables in Railway Dashboard
   - Railway provides a `.railway.app` domain with HTTPS

3. **Custom Domain**:
   - Add custom domain in Railway settings
   - SSL certificate automatically provisioned

### Self-Hosted (Advanced)

If self-hosting, you MUST configure HTTPS manually:

1. **SSL Certificate**:
   - Use Let's Encrypt (free) via Certbot
   - Or purchase SSL certificate from a CA

2. **Reverse Proxy**:
   - Use Nginx or Apache as reverse proxy
   - Configure SSL termination
   - Forward requests to Next.js app

3. **Example Nginx Configuration**:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /path/to/fullchain.pem;
       ssl_certificate_key /path/to/privkey.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Redirect HTTP to HTTPS
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

## ✅ Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables are configured with production values
- [ ] `NEXT_PUBLIC_APP_URL` uses `https://` protocol
- [ ] Stripe production API keys are configured (not test keys)
- [ ] Database is backed up and production-ready
- [ ] Stripe webhook endpoint is configured with production URL
- [ ] SSL certificate is valid and not expired
- [ ] All tests pass (`npm test`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Security headers are configured (see below)

## 🛡️ Security Headers

Add the following security headers to your deployment:

### Next.js Configuration

Add to `next.config.js`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## 🔍 Post-Deployment Verification

After deployment, verify:

1. **HTTPS is Active**:
   - Visit your site and check for padlock icon in browser
   - Verify SSL certificate is valid
   - Test that HTTP redirects to HTTPS

2. **Stripe Integration**:
   - Complete a test purchase with a real card (small amount)
   - Verify webhook events are received
   - Check order is created in database
   - Verify success page displays correctly

3. **Environment Variables**:
   - Check that `NEXT_PUBLIC_APP_URL` is correct in browser console
   - Verify Stripe publishable key is production key

4. **Security**:
   - Run security scan (e.g., Mozilla Observatory)
   - Verify security headers are present
   - Test webhook signature verification

## 📊 Monitoring

Set up monitoring for:

- **Stripe Dashboard**: Monitor payments, failed charges, disputes
- **Application Logs**: Monitor for errors and exceptions
- **Database**: Monitor connection pool, query performance
- **Uptime**: Use service like UptimeRobot or Pingdom

## 🆘 Troubleshooting

### Webhook Not Receiving Events

1. Verify webhook URL is correct in Stripe Dashboard
2. Check webhook URL uses HTTPS
3. Verify webhook secret matches environment variable
4. Check application logs for signature verification errors

### SSL Certificate Errors

1. Verify certificate is not expired
2. Check certificate chain is complete
3. Verify domain name matches certificate
4. Test with SSL Labs (ssllabs.com/ssltest)

### Payment Failures

1. Check Stripe Dashboard for error details
2. Verify API keys are production keys
3. Check application logs for errors
4. Verify customer has sufficient funds

## 📞 Support

For deployment issues:
- Email: info@bs3dcrafts.co
- Stripe Support: https://support.stripe.com

## 📄 Additional Resources

- [Stripe Production Checklist](https://stripe.com/docs/keys#production-checklist)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Security](https://vercel.com/docs/security)
- [Let's Encrypt](https://letsencrypt.org/)
