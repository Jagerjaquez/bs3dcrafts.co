# Task 4: Input Validation and Sanitization Layer - COMPLETED

## Summary

Successfully implemented comprehensive input validation and sanitization infrastructure for the Full Admin CMS system.

## Completed Subtasks

### ✅ 4.1 Create Zod Validation Schemas
**Files Created:**
- `lib/cms-validation.ts` - Complete validation schema library

**Implementation:**

Comprehensive Zod schemas for all CMS entities:

1. **PageSchema** - Page creation/updates
   - Title (1-200 chars)
   - Slug (URL-safe, lowercase, hyphens)
   - Content (required)
   - SEO fields (metaTitle ≤60, metaDescription ≤160, keywords ≤255)
   - Status (draft/published)

2. **ProductSchema** - Product management
   - Name, slug, description
   - Price (positive), discountedPrice (optional)
   - Stock (non-negative integer)
   - Category, material, printTimeEstimate, weight
   - Featured (boolean), status (draft/published)

3. **SettingsSchema** - Site settings
   - Key-value pairs
   - Category validation (general, contact, social, email, analytics, features)
   - BulkSettingsSchema for multiple updates

4. **NavigationSchema** - Menu items
   - Type (header/footer)
   - Label, URL validation
   - Parent-child relationships
   - Order (integer)

5. **ContentSchema** - Dynamic content sections
   - Key-value JSON structure
   - Section categorization

6. **Specialized Schemas:**
   - HeroSectionSchema - Homepage hero
   - CarouselItemSchema - Slider items
   - TestimonialSchema - Customer reviews
   - MediaUploadSchema - File uploads
   - OrderStatusUpdateSchema - Order management

**Helper Functions:**
- `generateSlug()` - URL-safe slug generation
- `formatValidationErrors()` - User-friendly error messages
- `safeParse()` - Safe parsing with formatted errors
- `EmailSchema`, `URLSchema` - Reusable validators

**Usage:**
```typescript
import { PageSchema, safeParse } from '@/lib/cms-validation'

const result = safeParse(PageSchema, data)
if (!result.success) {
  return NextResponse.json({ errors: result.errors }, { status: 400 })
}
```

### ✅ 4.3 Implement HTML Sanitization Utility
**Files Created:**
- `lib/sanitize.ts` - Complete sanitization library

**Dependencies Installed:**
- `isomorphic-dompurify` - XSS protection

**Implementation:**

Comprehensive sanitization functions:

1. **sanitizeHTML()** - Rich text sanitization
   - Allowed tags: headings, lists, links, images, tables, formatting
   - Allowed attributes: href, src, alt, title, class, style
   - URL scheme validation
   - Configurable options

2. **sanitizeToPlainText()** - Strip all HTML
   - Converts HTML to plain text
   - Removes all tags and attributes

3. **sanitizeBasicHTML()** - Basic formatting only
   - Allows: p, br, strong, em, u, a
   - For comments and short descriptions

4. **sanitizeURL()** - URL validation
   - Prevents javascript:, data:, vbscript: URIs
   - Allows http, https, mailto, tel, relative URLs

5. **containsXSS()** - XSS detection
   - Tests for common XSS patterns
   - Useful for testing and monitoring

6. **Additional Utilities:**
   - `escapeHTML()` / `unescapeHTML()` - Entity conversion
   - `sanitizeFilename()` - Safe filenames
   - `sanitizeJSON()` - JSON validation
   - `sanitizeCSS()` - CSS sanitization

**XSS Protection:**
- Blocks script tags
- Removes event handlers (onclick, etc.)
- Prevents iframe, object, embed
- Validates URL schemes
- Safe for templates

**Usage:**
```typescript
import { sanitizeHTML } from '@/lib/sanitize'

const safeContent = sanitizeHTML(userInput)
```

### ✅ 4.5 Create Slug Generation Utility
**Files Created:**
- `lib/slug.ts` - Complete slug generation library

**Implementation:**

Comprehensive slug management:

1. **generateSlug()** - Basic slug generation
   - Lowercase conversion
   - Turkish character handling (ğ→g, ü→u, ş→s, etc.)
   - Accent removal
   - Space/underscore to hyphen
   - Special character removal
   - Multiple hyphen consolidation
   - Length limit (100 chars)

2. **generateUniquePageSlug()** - Unique page slugs
   - Database uniqueness check
   - Auto-increment on collision
   - Exclude ID for updates
   - Safety limit (1000 attempts)

3. **generateUniqueProductSlug()** - Unique product slugs
   - Same features as page slugs
   - Separate namespace

4. **Validation Functions:**
   - `isValidSlug()` - Format validation
   - `sanitizeSlug()` - Ensure URL-safety
   - `pageSlugExists()` - Check existence
   - `productSlugExists()` - Check existence

5. **Advanced Features:**
   - `generateSlugWithPrefix()` - Categorized slugs
   - `extractSlugFromURL()` - Parse URLs
   - `generateSlugWithFallback()` - Random fallback
   - `suggestAlternativeSlugs()` - Collision suggestions

**Usage:**
```typescript
import { generateUniquePageSlug } from '@/lib/slug'

const slug = await generateUniquePageSlug(title, pageId)
```

## Security Features Implemented

1. **Input Validation**
   - Type-safe schemas with Zod
   - Length limits on all fields
   - Format validation (email, URL, slug)
   - Enum validation for status fields
   - Numeric range validation

2. **XSS Prevention**
   - HTML sanitization with DOMPurify
   - Whitelist-based tag filtering
   - Attribute sanitization
   - URL scheme validation
   - Script tag blocking

3. **SQL Injection Prevention**
   - Zod validation before database queries
   - Type-safe Prisma queries
   - No raw SQL with user input

4. **Path Traversal Prevention**
   - Filename sanitization
   - Path component removal
   - Special character filtering

## Integration Points

### API Endpoint Pattern

```typescript
import { safeParse, PageSchema } from '@/lib/cms-validation'
import { sanitizeHTML } from '@/lib/sanitize'
import { generateUniquePageSlug } from '@/lib/slug'

export async function POST(request: Request) {
  const body = await request.json()
  
  // Validate input
  const result = safeParse(PageSchema, body)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Validation failed', errors: result.errors },
      { status: 400 }
    )
  }
  
  const data = result.data
  
  // Sanitize HTML content
  data.content = sanitizeHTML(data.content)
  
  // Generate unique slug
  if (!data.slug) {
    data.slug = await generateUniquePageSlug(data.title)
  }
  
  // Create page
  const page = await prisma.page.create({ data })
  
  return NextResponse.json(page)
}
```

## Testing

All utilities are ready for use. Optional property tests can be implemented in tasks 4.2, 4.4, 4.6.

## Requirements Satisfied

- ✅ 15.1: Required field validation
- ✅ 15.2: Slug uniqueness validation
- ✅ 15.3: URL format validation
- ✅ 15.4: Email validation
- ✅ 15.5: Numeric validation
- ✅ 15.6: Stock validation
- ✅ 15.7: HTML sanitization
- ✅ 17.4: XSS prevention
- ✅ 5.5: Slug auto-generation
- ✅ 6.11: Product slug generation
- ✅ 3.9: Content validation
- ✅ 4.3: Navigation validation
- ✅ 6.13: Product validation
- ✅ 8.8: Settings validation

## Files Created

1. **lib/cms-validation.ts** (350+ lines)
   - 15+ Zod schemas
   - Type exports
   - Helper functions
   - Error formatting

2. **lib/sanitize.ts** (400+ lines)
   - HTML sanitization
   - XSS prevention
   - URL validation
   - Filename sanitization
   - JSON validation
   - CSS sanitization

3. **lib/slug.ts** (350+ lines)
   - Slug generation
   - Uniqueness checking
   - Turkish character support
   - Validation functions
   - Alternative suggestions

## Next Steps

1. Apply validation to admin API endpoints
2. Apply sanitization to all user input
3. Use slug generation in page/product creation
4. Implement optional property tests (4.2, 4.4, 4.6)

---

**Status:** ✅ COMPLETE
**Date:** 2026-04-03
**Task:** 4. Input validation and sanitization layer
