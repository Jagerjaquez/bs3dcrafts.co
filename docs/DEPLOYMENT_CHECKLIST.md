# BS3DCrafts CMS Deployment Checklist

## Pre-Deployment Requirements

### System Requirements
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database available
- [ ] Supabase account and project created
- [ ] Domain name configured
- [ ] SSL certificate available

### Development Environment
- [ ] All tests passing (`npm run test`)
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors
- [ ] All dependencies up to date

## Environment Variables Setup

### Required Environment Variables

Create `.env.local` file with the following variables:

#### Database Configuration
```bash
# PostgreSQL Database URL
DATABASE_URL="postgresql://username:password@host:port/database"

# Prisma Database URL (same as above for production)
PRISMA_DATABASE_URL="postgresql://username:password@host:port/database"
```

#### Supabase Configuration
```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"

# Supabase Anon Key (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Supabase Service Role Key (private - for admin operations)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

#### Authentication & Security
```bash
# Admin authentication secret (generate with: openssl rand -base64 32)
ADMIN_SECRET="your-secure-admin-secret"

# Session secret for JWT tokens (generate with: openssl rand -base64 32)
SESSION_SECRET="your-session-secret"

# CSRF token secret (generate with: openssl rand -base64 32)
CSRF_SECRET="your-csrf-secret"
```

#### Email Configuration (SMTP)
```bash
# SMTP Server Settings
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Email From Address
EMAIL_FROM="noreply@bs3dcrafts.com"
EMAIL_FROM_NAME="BS3DCrafts"
```

#### Analytics & Tracking
```bash
# Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Facebook Pixel ID
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="your-pixel-id"
```

#### Payment Integration (PayTR)
```bash
# PayTR Configuration
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"
```

#### Optional Configuration
```bash
# Redis URL for caching (optional)
REDIS_URL="redis://localhost:6379"

# Webhook URLs
WEBHOOK_SECRET="your-webhook-secret"

# Rate Limiting
RATE_LIMIT_ENABLED="true"
RATE_LIMIT_MAX_REQUESTS="100"
RATE_LIMIT_WINDOW_MS="60000"
```

### Environment Variable Checklist
- [ ] All required variables defined
- [ ] Secrets are properly generated (32+ character random strings)
- [ ] Database URL is correct and accessible
- [ ] Supabase keys are valid
- [ ] SMTP settings tested
- [ ] No sensitive data in version control

## Database Setup

### 1. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

### 2. Database Seeding
```bash
# Seed initial data
npm run seed:cms

# Verify seeded data
npx prisma studio
```

### 3. Database Indexes
Verify the following indexes are created:
- [ ] SiteContent: key, section
- [ ] Page: slug, status
- [ ] Media: type, uploadedAt
- [ ] Settings: key, category
- [ ] Navigation: type, parentId, order
- [ ] Product: category, slug, status, featured

## Supabase Storage Setup

### 1. Create Storage Buckets
```sql
-- Create products bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true);

-- Create media bucket for general media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true);

-- Create pages bucket for page content images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pages', 'pages', true);
```

### 2. Set Storage Policies
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id IN ('products', 'media', 'pages'));

-- Allow authenticated uploads
CREATE POLICY "Authenticated upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id IN ('products', 'media', 'pages'));

-- Allow authenticated updates
CREATE POLICY "Authenticated update" ON storage.objects 
FOR UPDATE USING (bucket_id IN ('products', 'media', 'pages'));

-- Allow authenticated deletes
CREATE POLICY "Authenticated delete" ON storage.objects 
FOR DELETE USING (bucket_id IN ('products', 'media', 'pages'));
```

### 3. Storage Configuration Checklist
- [ ] Storage buckets created
- [ ] Public access policies set
- [ ] Upload policies configured
- [ ] File size limits configured (5MB)
- [ ] CORS settings configured for domain

## Admin Account Creation

### 1. Create Initial Admin User
```bash
# Run the admin creation script
npm run create-admin

# Or manually via Prisma Studio:
# 1. Open Prisma Studio: npx prisma studio
# 2. Navigate to Admin table
# 3. Create new record with:
#    - email: admin@bs3dcrafts.com
#    - password: (hashed with bcrypt)
#    - role: admin
#    - active: true
```

### 2. Admin Account Checklist
- [ ] Admin user created
- [ ] Password is secure (12+ characters)
- [ ] Email is accessible
- [ ] Admin can log in successfully
- [ ] Admin has full access to all sections

## Application Deployment

### 1. Build Process
```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Build application
npm run build

# Test build locally
npm start
```

### 2. Deployment Platform Setup

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

#### Docker Deployment
```dockerfile
# Use provided Dockerfile
docker build -t bs3dcrafts-cms .
docker run -p 3000:3000 bs3dcrafts-cms
```

### 3. Domain Configuration
- [ ] Domain DNS configured
- [ ] SSL certificate installed
- [ ] HTTPS redirect enabled
- [ ] www redirect configured (if needed)

## Post-Deployment Verification

### 1. Application Health Checks
- [ ] Homepage loads correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Database connection working
- [ ] File uploads working
- [ ] Email sending functional

### 2. API Endpoint Testing
```bash
# Test public endpoints
curl https://yourdomain.com/api/content/homepage
curl https://yourdomain.com/api/content/navigation
curl https://yourdomain.com/api/content/settings

# Test admin endpoints (with authentication)
curl -H "Authorization: Bearer <token>" https://yourdomain.com/api/admin/dashboard
```

### 3. Performance Testing
- [ ] Lighthouse score > 90
- [ ] Page load times < 3 seconds
- [ ] Image optimization working
- [ ] CDN delivering assets
- [ ] Caching headers set correctly

### 4. Security Testing
- [ ] HTTPS enforced
- [ ] Admin routes protected
- [ ] CSRF protection active
- [ ] Rate limiting functional
- [ ] Input validation working
- [ ] XSS protection enabled

## Backup Procedures

### 1. Database Backup Setup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
```

### 2. Automated Backup Configuration
- [ ] Daily database backups scheduled
- [ ] Backup retention policy set (30 days)
- [ ] Backup storage location configured
- [ ] Backup restoration tested

### 3. File Backup
- [ ] Supabase Storage backup configured
- [ ] Media files backup scheduled
- [ ] Application code backup (Git repository)

### 4. Backup Verification
- [ ] Test database restore process
- [ ] Verify backup file integrity
- [ ] Document recovery procedures
- [ ] Test disaster recovery plan

## Monitoring Setup

### 1. Application Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring active
- [ ] Uptime monitoring set up
- [ ] Log aggregation configured

### 2. Database Monitoring
- [ ] Connection pool monitoring
- [ ] Query performance tracking
- [ ] Storage usage alerts
- [ ] Backup success monitoring

### 3. Infrastructure Monitoring
- [ ] Server resource monitoring
- [ ] CDN performance tracking
- [ ] SSL certificate expiry alerts
- [ ] Domain expiry monitoring

## Security Hardening

### 1. Application Security
- [ ] Security headers configured
- [ ] Content Security Policy set
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] SQL injection protection verified

### 2. Infrastructure Security
- [ ] Firewall rules configured
- [ ] Database access restricted
- [ ] Admin access limited by IP (if required)
- [ ] Regular security updates scheduled

### 3. Access Control
- [ ] Admin accounts reviewed
- [ ] Unused accounts disabled
- [ ] Password policies enforced
- [ ] Two-factor authentication considered

## Go-Live Checklist

### Final Pre-Launch Steps
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Backup systems verified
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team training completed

### Launch Day
- [ ] DNS cutover completed
- [ ] SSL certificate active
- [ ] Application responding correctly
- [ ] Admin panel accessible
- [ ] Email notifications working
- [ ] Payment processing functional (if applicable)
- [ ] Analytics tracking active

### Post-Launch
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backup completion
- [ ] Review security logs
- [ ] Collect user feedback
- [ ] Document any issues

## Rollback Plan

### Emergency Rollback Procedure
1. **Immediate Actions**
   - [ ] Revert DNS to previous version
   - [ ] Restore previous application version
   - [ ] Verify rollback successful

2. **Database Rollback**
   - [ ] Restore database from backup
   - [ ] Verify data integrity
   - [ ] Test application functionality

3. **Communication**
   - [ ] Notify stakeholders
   - [ ] Update status page
   - [ ] Document incident

## Support Information

### Technical Contacts
- **System Administrator**: [contact-info]
- **Database Administrator**: [contact-info]
- **DevOps Engineer**: [contact-info]

### Service Providers
- **Hosting**: Vercel/AWS/etc.
- **Database**: Supabase
- **CDN**: Supabase Storage
- **Email**: SMTP Provider
- **Domain**: Domain Registrar

### Emergency Procedures
- **Incident Response Plan**: [link-to-plan]
- **Escalation Matrix**: [contact-hierarchy]
- **Service Status Page**: [status-url]

---

**Note**: This checklist should be customized based on your specific deployment environment and requirements. Always test the deployment process in a staging environment before going live.