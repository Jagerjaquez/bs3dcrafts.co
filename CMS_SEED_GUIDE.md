# CMS Seed Script Guide

## Overview

The CMS seed script (`prisma/seed-cms.ts`) populates the database with default CMS data including site settings, pages, and navigation structure. This is essential for the Full Admin CMS feature to function properly.

## What Gets Seeded

### 1. Site Settings (17 items)

#### General Settings
- `site.title`: BS3DCrafts
- `site.tagline`: Precision in Every Layer
- `site.description`: Professional 3D printing services description
- `site.keywords`: SEO keywords

#### Contact Information
- `contact.email`: bs3dcrafts.co@outlook.com
- `contact.phone`: +90 546 451 95 97
- `contact.whatsapp`: 905464519597
- `contact.address`: Karşıyaka, İzmir, Türkiye

#### Social Media Links
- `social.instagram`: https://instagram.com/bs3dcrafts
- `social.twitter`: (empty)
- `social.facebook`: (empty)
- `social.linkedin`: (empty)

#### Feature Toggles
- `features.newsletter`: true
- `features.whatsapp_button`: true
- `features.testimonials`: true

#### Analytics
- `analytics.google_id`: (empty)
- `analytics.facebook_pixel`: (empty)

### 2. Default Pages (4 pages)

All pages are created in **published** status with full Turkish content:

1. **Hakkımızda** (`/about`)
   - About BS3DCrafts
   - Mission statement
   - Why choose us
   - Contact information

2. **Sıkça Sorulan Sorular** (`/faq`)
   - What is 3D printing?
   - Materials used
   - Order process
   - Delivery times
   - Custom designs
   - Return policy
   - Bulk orders
   - Payment methods

3. **Kullanım Koşulları** (`/terms`)
   - General terms
   - Service scope
   - Orders and payments
   - Delivery
   - Returns and cancellations
   - Intellectual property
   - Liability limitations
   - Privacy
   - Changes
   - Contact

4. **Gizlilik Politikası** (`/privacy`)
   - Introduction
   - Collected information
   - Information usage
   - Information sharing
   - Cookies
   - Data security
   - User rights (KVKK)
   - Children's privacy
   - Changes
   - Contact

### 3. Navigation Structure (10 items)

#### Header Navigation (5 items)
1. Ana Sayfa → /
2. Ürünler → /products
3. Hakkımızda → /about
4. SSS → /faq
5. İletişim → /contact

#### Footer Navigation (5 items)
1. Hakkımızda → /about
2. Sıkça Sorulan Sorular → /faq
3. Kullanım Koşulları → /terms
4. Gizlilik Politikası → /privacy
5. İletişim → /contact

## Usage

### Running the Seed Script

```bash
npm run seed:cms
```

### When to Run

- **After initial database setup**: Run once after creating the database schema
- **After database reset**: If you reset the database, run this to restore default CMS data
- **Development environment**: Safe to run multiple times (duplicate prevention included)

### Duplicate Prevention

The script automatically checks if CMS data already exists:
- If any Settings, Pages, or Navigation items exist, the script skips seeding
- This prevents duplicate data and allows safe re-runs

### Output Example

```
🌱 Seeding CMS data...
📝 Seeding site settings...
✅ Created 17 site settings
📄 Seeding default pages...
✅ Created 4 default pages
🧭 Seeding navigation structure...
✅ Created 5 header navigation items
✅ Created 5 footer navigation items
✨ CMS seeding completed successfully!

📊 Summary:
   - Settings: 17 items
   - Pages: 4 pages
   - Navigation: 10 items (5 header + 5 footer)
```

## Verification

To verify the seeded data:

```bash
npx tsx scripts/verify-cms-seed.ts
```

This will display:
- Count of settings by category
- List of all pages with slugs and status
- Header navigation items in order
- Footer navigation items in order
- Sample settings values

## Customization

### Modifying Default Data

Edit `prisma/seed-cms.ts` to customize:

1. **Settings**: Update the `settings` array with your values
2. **Pages**: Modify page content, titles, or add new pages
3. **Navigation**: Change menu items, URLs, or order

### Adding New Settings

```typescript
{ 
  key: 'your.setting.key', 
  value: 'your value', 
  category: 'general' // or contact, social, features, analytics
}
```

### Adding New Pages

```typescript
{
  title: 'Your Page Title',
  slug: 'your-page-slug',
  content: '<h1>Your HTML Content</h1><p>...</p>',
  metaTitle: 'SEO Title',
  metaDescription: 'SEO Description',
  keywords: 'keywords, separated, by, commas',
  status: 'published' // or 'draft'
}
```

### Adding Navigation Items

```typescript
{ 
  type: 'header', // or 'footer'
  label: 'Menu Label', 
  url: '/path', 
  order: 6 // determines position
}
```

## Integration with Admin Panel

Once seeded, this data can be managed through the Admin Panel:

- **Settings**: `/admin/settings`
- **Pages**: `/admin/pages`
- **Navigation**: `/admin/content/navigation`

## Database Schema

The seed script populates these tables:

- `Settings`: Site-wide configuration
- `Page`: Dynamic pages with rich content
- `Navigation`: Header and footer menus

See `prisma/schema.prisma` for full schema details.

## Troubleshooting

### Error: "Table does not exist"

Run database migrations first:
```bash
npm run db:migrate
```

### Error: "Unique constraint failed"

Data already exists. The script should skip automatically, but if you want to re-seed:
1. Delete existing data manually or reset database
2. Run the seed script again

### Verification Failed

Check database connection:
```bash
npm run db:studio
```

## Related Files

- `prisma/seed-cms.ts` - Main seed script
- `prisma/seed.ts` - Product seed script (separate)
- `scripts/verify-cms-seed.ts` - Verification script
- `package.json` - Contains `seed:cms` script definition

## Requirements Fulfilled

This seed script fulfills the following requirements from the Full Admin CMS spec:

- **Requirement 8.1**: Site title and tagline
- **Requirement 8.2**: Meta description and SEO keywords
- **Requirement 8.3**: Contact information (email, phone, WhatsApp, address)
- **Requirement 5.3**: Default pages (About, FAQ, Terms, Privacy)

## Next Steps

After seeding:

1. ✅ Verify data with verification script
2. 🔐 Set up admin authentication
3. 🎨 Build admin panel UI
4. 🌐 Integrate with frontend pages
5. 📝 Customize content through admin panel

## Contact Information

The seed script uses the real contact information:
- **Email**: bs3dcrafts.co@outlook.com
- **Phone**: +90 546 451 95 97
- **WhatsApp**: 905464519597
- **Address**: Karşıyaka, İzmir, Türkiye
- **Domain**: bs3dcrafts.com

This information can be updated later through the admin panel settings page.
