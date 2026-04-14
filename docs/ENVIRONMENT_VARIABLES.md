# Environment Variables Documentation

This document describes all environment variables used in the BS3DCrafts CMS application.

## Quick Setup

1. Copy `.env.example` to `.env.local`
2. Generate admin credentials: `node scripts/generate-admin-password.js`
3. Update database and Supabase URLs
4. Configure email settings
5. Set up analytics (optional)

## Required Variables

### Database Configuration

#### `DATABASE_URL`
- **Description**: PostgreSQL database connection string with connection pooling
- **Format**: `postgresql://username:password@host:port/database?pgbouncer=true`
- **Example**: `postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- **Required**: Yes
- **Notes**: Use pooled connection for better performance

#### `DIRECT_URL`
- **Description**: Direct PostgreSQL connection for migrations
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://postgres.xxx:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`
- **Required**: Yes (for migrations)
- **Notes**: Required for Prisma migrations, bypasses connection pooling

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Supabase project URL
- **Format**: `https://your-project-id.supabase.co`
- **Example**: `https://abcdefghijk.supabase.co`
- **Required**: Yes
- **Notes**: Public variable, safe to expose to client

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Supabase anonymous/public key
- **Format**: JWT token string
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Required**: Yes
- **Notes**: Public variable, safe to expose to client

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Description**: Supabase service role key for admin operations
- **Format**: JWT token string
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Required**: Yes
- **Notes**: **PRIVATE** - Never expose to client, used for admin operations

### Admin Authentication & Security

#### `ADMIN_SECRET`
- **Description**: Secret key for admin authentication (legacy)
- **Format**: Base64 encoded string (minimum 32 characters)
- **Example**: `AdhS6W+BE8bvL17CG/8+ZxsHgUmyOTMVShvuKDaousI=`
- **Required**: Yes
- **Generation**: `openssl rand -base64 32`
- **Notes**: Use for initial setup, migrate to `ADMIN_PASSWORD_HASH`

#### `SESSION_SECRET`
- **Description**: Secret key for session management and JWT tokens
- **Format**: Base64 encoded string (minimum 32 characters)
- **Example**: `Xk9mP2vL8nQ4wR7tY6uI3oP5aS1dF0gH9jK2lZ4xC8vB6nM3qW5eR7tY9uI1oP3a`
- **Required**: Yes
- **Generation**: `openssl rand -base64 32`
- **Notes**: Critical for session security

#### `CSRF_SECRET`
- **Description**: Secret key for CSRF token generation
- **Format**: Base64 encoded string (minimum 32 characters)
- **Example**: `9jK2lZ4xC8vB6nM3qW5eR7tY9uI1oP3aXk9mP2vL8nQ4wR7tY6uI3oP5aS1dF0gH`
- **Required**: Yes
- **Generation**: `openssl rand -base64 32`
- **Notes**: Protects against CSRF attacks

#### `ADMIN_PASSWORD_HASH` (Recommended)
- **Description**: Bcrypt hash of admin password
- **Format**: Bcrypt hash string
- **Example**: `$2b$12$example.hash.here`
- **Required**: No (but recommended)
- **Generation**: `node scripts/generate-admin-password.js`
- **Notes**: More secure than plain text `ADMIN_SECRET`

### Email Configuration

#### SMTP Configuration (Primary)

#### `SMTP_HOST`
- **Description**: SMTP server hostname
- **Format**: Hostname string
- **Example**: `smtp.gmail.com`
- **Required**: Yes (for email functionality)
- **Notes**: Gmail, Outlook, or custom SMTP server

#### `SMTP_PORT`
- **Description**: SMTP server port
- **Format**: Port number
- **Example**: `587` (TLS) or `465` (SSL)
- **Required**: Yes
- **Notes**: Use 587 for TLS, 465 for SSL

#### `SMTP_SECURE`
- **Description**: Use SSL/TLS encryption
- **Format**: Boolean string
- **Example**: `false` (for TLS) or `true` (for SSL)
- **Required**: Yes
- **Notes**: `false` for port 587, `true` for port 465

#### `SMTP_USER`
- **Description**: SMTP authentication username
- **Format**: Email address
- **Example**: `noreply@bs3dcrafts.com`
- **Required**: Yes
- **Notes**: Usually your email address

#### `SMTP_PASS`
- **Description**: SMTP authentication password
- **Format**: Password string
- **Example**: `your-app-password`
- **Required**: Yes
- **Notes**: Use app-specific password for Gmail

#### `EMAIL_FROM`
- **Description**: Default sender email address
- **Format**: Email address
- **Example**: `noreply@bs3dcrafts.com`
- **Required**: Yes
- **Notes**: Must be authorized to send from SMTP server

#### `EMAIL_FROM_NAME`
- **Description**: Default sender name
- **Format**: String
- **Example**: `BS3DCrafts`
- **Required**: No
- **Notes**: Displayed as sender name in emails

#### Resend Configuration (Alternative)

#### `RESEND_API_KEY`
- **Description**: Resend service API key
- **Format**: API key string
- **Example**: `re_123456789`
- **Required**: No (alternative to SMTP)
- **Notes**: Get from https://resend.com/api-keys

#### `EMAIL_REPLY_TO`
- **Description**: Reply-to email address
- **Format**: Email address
- **Example**: `support@bs3dcrafts.com`
- **Required**: No
- **Notes**: Where replies will be sent

#### `ADMIN_EMAIL`
- **Description**: Admin notification email
- **Format**: Email address
- **Example**: `admin@bs3dcrafts.com`
- **Required**: No
- **Notes**: Receives system notifications

### Payment Configuration

#### Stripe

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Description**: Stripe publishable key
- **Format**: Stripe key string
- **Example**: `pk_test_51TG8jtKIgm4H4bAo...`
- **Required**: Yes (for payments)
- **Notes**: Public variable, safe to expose

#### `STRIPE_SECRET_KEY`
- **Description**: Stripe secret key
- **Format**: Stripe key string
- **Example**: `sk_test_51TG8jtKIgm4H4bAo...`
- **Required**: Yes
- **Notes**: **PRIVATE** - Never expose to client

#### `STRIPE_WEBHOOK_SECRET`
- **Description**: Stripe webhook endpoint secret
- **Format**: Webhook secret string
- **Example**: `whsec_fMsPSUgn1O1sYDZc7rk7qmlwpzP6asqr`
- **Required**: Yes (for webhooks)
- **Notes**: Validates webhook authenticity

#### PayTR (Turkish Payment Gateway)

#### `PAYTR_MERCHANT_ID`
- **Description**: PayTR merchant ID
- **Format**: Numeric string
- **Example**: `688326`
- **Required**: Yes (for PayTR payments)
- **Notes**: Provided by PayTR

#### `PAYTR_MERCHANT_KEY`
- **Description**: PayTR merchant key
- **Format**: Alphanumeric string
- **Example**: `L41xQS1JDRCr7x5Z`
- **Required**: Yes
- **Notes**: **PRIVATE** - Used for API authentication

#### `PAYTR_MERCHANT_SALT`
- **Description**: PayTR merchant salt
- **Format**: Alphanumeric string
- **Example**: `jRLqR8GFAuW7Dfop`
- **Required**: Yes
- **Notes**: **PRIVATE** - Used for hash generation

#### `PAYTR_TEST_MODE`
- **Description**: Enable PayTR test mode
- **Format**: Boolean string
- **Example**: `true` or `false`
- **Required**: No
- **Default**: `false`
- **Notes**: Use `true` for testing

### CMS Configuration

#### `CMS_CACHE_TTL`
- **Description**: Cache time-to-live for content endpoints (seconds)
- **Format**: Number string
- **Example**: `300` (5 minutes)
- **Required**: No
- **Default**: `300`
- **Notes**: Balances performance and content freshness

#### `CMS_UPLOAD_MAX_SIZE`
- **Description**: Maximum file upload size (bytes)
- **Format**: Number string
- **Example**: `5242880` (5MB)
- **Required**: No
- **Default**: `5242880`
- **Notes**: Adjust based on server limits

#### `CMS_ALLOWED_FILE_TYPES`
- **Description**: Allowed MIME types for uploads
- **Format**: Comma-separated string
- **Example**: `image/jpeg,image/png,image/webp,image/gif`
- **Required**: No
- **Default**: Image types only
- **Notes**: Security measure to prevent malicious uploads

### Rate Limiting

#### `RATE_LIMIT_ENABLED`
- **Description**: Enable rate limiting
- **Format**: Boolean string
- **Example**: `true` or `false`
- **Required**: No
- **Default**: `true`
- **Notes**: Disable for development if needed

#### `RATE_LIMIT_PUBLIC_MAX`
- **Description**: Max requests per minute for public endpoints
- **Format**: Number string
- **Example**: `100`
- **Required**: No
- **Default**: `100`
- **Notes**: Per IP address

#### `RATE_LIMIT_ADMIN_MAX`
- **Description**: Max requests per minute for admin endpoints
- **Format**: Number string
- **Example**: `200`
- **Required**: No
- **Default**: `200`
- **Notes**: Per admin session

#### `RATE_LIMIT_AUTH_MAX`
- **Description**: Max authentication attempts per 15 minutes
- **Format**: Number string
- **Example**: `5`
- **Required**: No
- **Default**: `5`
- **Notes**: Prevents brute force attacks

#### `RATE_LIMIT_WINDOW_MS`
- **Description**: Rate limit window in milliseconds
- **Format**: Number string
- **Example**: `60000` (1 minute)
- **Required**: No
- **Default**: `60000`
- **Notes**: Time window for rate limiting

### Analytics & Tracking

#### `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Description**: Google Analytics 4 Measurement ID
- **Format**: GA4 ID string
- **Example**: `G-XXXXXXXXXX`
- **Required**: No
- **Notes**: Public variable, enables Google Analytics

#### `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
- **Description**: Facebook Pixel ID
- **Format**: Numeric string
- **Example**: `123456789012345`
- **Required**: No
- **Notes**: Public variable, enables Facebook tracking

### User Authentication (Legacy)

#### `JWT_SECRET`
- **Description**: JWT secret for user authentication
- **Format**: Base64 encoded string
- **Example**: `Xk9mP2vL8nQ4wR7tY6uI3oP5aS1dF0gH9jK2lZ4xC8vB6nM3qW5eR7tY9uI1oP3a`
- **Required**: Yes
- **Generation**: `openssl rand -base64 32`
- **Notes**: Used for customer JWT tokens

### Site Configuration

#### `NEXT_PUBLIC_SITE_URL`
- **Description**: Public site URL
- **Format**: URL string
- **Example**: `https://bs3dcrafts.com`
- **Required**: Yes
- **Notes**: Used for absolute URLs and redirects

#### `NEXT_PUBLIC_APP_URL`
- **Description**: Application URL (same as SITE_URL)
- **Format**: URL string
- **Example**: `https://bs3dcrafts.com`
- **Required**: Yes
- **Notes**: Legacy variable, use SITE_URL

#### `NEXT_PUBLIC_BASE_URL`
- **Description**: Base URL for API calls
- **Format**: URL string
- **Example**: `https://bs3dcrafts.com`
- **Required**: Yes
- **Notes**: Used by client-side API calls

### Monitoring (Optional)

#### `NEXT_PUBLIC_SENTRY_DSN`
- **Description**: Sentry error tracking DSN
- **Format**: Sentry DSN URL
- **Example**: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`
- **Required**: No
- **Notes**: Public variable, enables error tracking

#### `SENTRY_AUTH_TOKEN`
- **Description**: Sentry authentication token
- **Format**: Token string
- **Example**: `sntrys_xxxxx`
- **Required**: No
- **Notes**: For build-time source map uploads

#### `SENTRY_ORG`
- **Description**: Sentry organization slug
- **Format**: String
- **Example**: `bs3dcrafts`
- **Required**: No
- **Notes**: Your Sentry organization

#### `SENTRY_PROJECT`
- **Description**: Sentry project slug
- **Format**: String
- **Example**: `bs3dcrafts-cms`
- **Required**: No
- **Notes**: Your Sentry project

## Environment-Specific Configuration

### Development (.env.local)
```bash
# Use localhost URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Use test payment keys
STRIPE_SECRET_KEY=sk_test_...
PAYTR_TEST_MODE=true

# Relaxed rate limits
RATE_LIMIT_PUBLIC_MAX=1000
RATE_LIMIT_ADMIN_MAX=2000
```

### Production (.env)
```bash
# Use production URLs
NEXT_PUBLIC_SITE_URL=https://bs3dcrafts.com
NEXT_PUBLIC_APP_URL=https://bs3dcrafts.com
NEXT_PUBLIC_BASE_URL=https://bs3dcrafts.com

# Use live payment keys
STRIPE_SECRET_KEY=sk_live_...
PAYTR_TEST_MODE=false

# Standard rate limits
RATE_LIMIT_PUBLIC_MAX=100
RATE_LIMIT_ADMIN_MAX=200
```

## Security Best Practices

### Secret Generation
```bash
# Generate secure secrets
openssl rand -base64 32

# PowerShell alternative
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### Admin Password Setup
```bash
# Generate admin credentials
node scripts/generate-admin-password.js

# Generate with custom password
node scripts/generate-admin-password.js --password "your-secure-password"
```

### Environment File Security
- Never commit `.env` files to version control
- Use different secrets for each environment
- Rotate secrets regularly
- Use environment-specific configurations
- Limit access to production environment variables

### Validation Checklist
- [ ] All required variables are set
- [ ] Secrets are properly generated (32+ characters)
- [ ] Database URLs are correct and accessible
- [ ] Email configuration is tested
- [ ] Payment keys match the environment (test/live)
- [ ] Site URLs are correct for the environment
- [ ] No sensitive data in version control

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Check database server is accessible
- Ensure connection pooling is properly configured

#### Email Not Sending
- Verify SMTP credentials are correct
- Check SMTP server allows connections from your IP
- For Gmail, use app-specific passwords
- Test with a simple SMTP client

#### Admin Login Issues
- Ensure `ADMIN_SECRET` or `ADMIN_PASSWORD_HASH` is set
- Verify `SESSION_SECRET` is configured
- Check admin user exists in database
- Clear browser cookies and try again

#### File Upload Failures
- Check `CMS_UPLOAD_MAX_SIZE` is appropriate
- Verify `CMS_ALLOWED_FILE_TYPES` includes your file type
- Ensure Supabase Storage is properly configured
- Check file permissions and storage quotas

#### Rate Limiting Issues
- Adjust rate limit values for your needs
- Set `RATE_LIMIT_ENABLED=false` for development
- Check if your IP is being rate limited
- Monitor rate limit headers in responses

### Getting Help

If you encounter issues with environment variables:

1. Check this documentation for the correct format
2. Verify all required variables are set
3. Test with minimal configuration first
4. Check application logs for specific error messages
5. Consult the deployment checklist for environment-specific setup

---

**Note**: Keep this documentation updated when adding new environment variables or changing existing ones.