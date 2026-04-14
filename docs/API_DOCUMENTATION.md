# BS3DCrafts CMS API Documentation

## Overview

The BS3DCrafts CMS provides a comprehensive RESTful API for managing content, products, orders, and site settings. The API is divided into two main categories:

- **Public API**: Endpoints for fetching published content (no authentication required)
- **Admin API**: Endpoints for content management (authentication required)

## Base URL

```
Production: https://bs3dcrafts.com/api
Development: http://localhost:3000/api
```

## Authentication

### Admin Authentication

Admin endpoints require authentication via session-based tokens. Authentication is handled through secure HTTP-only cookies.

#### Login Process

1. **POST** `/api/admin/login` with credentials
2. Receive session cookie in response
3. Include cookie in subsequent requests

#### Authentication Headers

```http
Cookie: admin_session=<session-token>
X-CSRF-Token: <csrf-token>
```

### CSRF Protection

All state-changing admin operations (POST, PUT, DELETE) require CSRF tokens:

1. **GET** `/api/admin/csrf-token` to obtain token
2. Include token in `X-CSRF-Token` header

## Rate Limiting

- **Public Endpoints**: 100 requests per minute per IP
- **Admin Endpoints**: 200 requests per minute per session
- **Authentication Endpoints**: 5 attempts per 15 minutes per IP

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  }
}
```

## Public Content API

### Homepage Content

#### GET /api/content/homepage

Fetch all homepage section data.

**Response:**
```json
{
  "hero": {
    "title": "Welcome to BS3DCrafts",
    "description": "Precision in Every Layer",
    "buttonText": "Shop Now",
    "buttonUrl": "/products",
    "backgroundImage": "https://cdn.supabase.co/hero-bg.jpg"
  },
  "carousel": [
    {
      "id": "carousel-1",
      "image": "https://cdn.supabase.co/carousel-1.jpg",
      "title": "Featured Product",
      "description": "Amazing 3D printed item",
      "link": "/products/featured-item"
    }
  ],
  "testimonials": [
    {
      "id": "testimonial-1",
      "name": "John Doe",
      "role": "Customer",
      "comment": "Excellent quality and service!",
      "rating": 5,
      "avatar": "https://cdn.supabase.co/avatar-1.jpg"
    }
  ],
  "stats": {
    "productsCount": 150,
    "customersCount": 500,
    "projectsCount": 1000
  },
  "newsletter": {
    "title": "Stay Updated",
    "description": "Get the latest news and offers",
    "enabled": true
  }
}
```

**Caching:** 5 minutes

### Navigation

#### GET /api/content/navigation

Fetch header and footer navigation menus.

**Response:**
```json
{
  "header": [
    {
      "id": "nav-1",
      "label": "Products",
      "url": "/products",
      "children": [
        {
          "id": "nav-1-1",
          "label": "3D Prints",
          "url": "/products/3d-prints"
        }
      ]
    }
  ],
  "footer": [
    {
      "id": "footer-1",
      "label": "About Us",
      "url": "/about"
    }
  ]
}
```

**Caching:** 5 minutes

### Dynamic Pages

#### GET /api/content/pages/:slug

Fetch dynamic page content by slug.

**Parameters:**
- `slug` (string): Page URL slug

**Response:**
```json
{
  "title": "About Us",
  "content": "<p>Rich HTML content...</p>",
  "metaTitle": "About BS3DCrafts - 3D Printing Experts",
  "metaDescription": "Learn about our 3D printing services...",
  "keywords": "3d printing, custom prints, bs3dcrafts",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `404` - Page not found or not published

**Caching:** 5 minutes

### Site Settings

#### GET /api/content/settings

Fetch public site settings.

**Response:**
```json
{
  "siteTitle": "BS3DCrafts",
  "tagline": "Precision in Every Layer",
  "contactEmail": "info@bs3dcrafts.com",
  "contactPhone": "+1-555-0123",
  "whatsappNumber": "+1-555-0123",
  "address": "123 Maker Street, Tech City, TC 12345",
  "socialMedia": {
    "instagram": "https://instagram.com/bs3dcrafts",
    "twitter": "https://twitter.com/bs3dcrafts",
    "facebook": "https://facebook.com/bs3dcrafts",
    "linkedin": "https://linkedin.com/company/bs3dcrafts"
  },
  "features": {
    "newsletter": true,
    "whatsappButton": true,
    "testimonials": true
  }
}
```

**Caching:** 10 minutes

## Admin Content API

All admin endpoints require authentication and CSRF tokens for state-changing operations.

### Authentication

#### POST /api/admin/login

Authenticate admin user.

**Request:**
```json
{
  "email": "admin@bs3dcrafts.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "admin-1",
    "email": "admin@bs3dcrafts.com",
    "role": "admin"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `429` - Too many login attempts

#### POST /api/admin/logout

Logout admin user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET /api/admin/csrf-token

Get CSRF token for form submissions.

**Response:**
```json
{
  "csrfToken": "abc123def456"
}
```

### Dashboard

#### GET /api/admin/dashboard

Get dashboard metrics and recent activity.

**Response:**
```json
{
  "metrics": {
    "totalProducts": 150,
    "ordersByStatus": {
      "pending": 5,
      "paid": 12,
      "shipped": 8,
      "completed": 45
    },
    "totalUsers": 250,
    "totalRevenue": 15000.00
  },
  "recentActivity": [
    {
      "id": "activity-1",
      "type": "product",
      "action": "created",
      "title": "New Product Added",
      "timestamp": "2024-01-15T10:30:00Z",
      "adminId": "admin-1"
    }
  ],
  "systemStatus": {
    "database": "healthy",
    "storage": "healthy",
    "email": "healthy"
  }
}
```

### Content Management

#### POST /api/admin/content

Create new content section.

**Request:**
```json
{
  "key": "homepage.hero",
  "value": {
    "title": "Welcome to BS3DCrafts",
    "description": "Precision in Every Layer",
    "buttonText": "Shop Now",
    "buttonUrl": "/products",
    "backgroundImage": "https://cdn.supabase.co/hero-bg.jpg"
  },
  "section": "homepage"
}
```

**Response:**
```json
{
  "id": "content-1",
  "key": "homepage.hero",
  "value": { /* content object */ },
  "section": "homepage",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### PUT /api/admin/content/:key

Update existing content section.

**Parameters:**
- `key` (string): Content key (e.g., "homepage.hero")

**Request:**
```json
{
  "value": {
    "title": "Updated Welcome Message",
    "description": "New description"
  }
}
```

**Response:**
```json
{
  "id": "content-1",
  "key": "homepage.hero",
  "value": { /* updated content */ },
  "section": "homepage",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

#### DELETE /api/admin/content/:key

Delete content section.

**Parameters:**
- `key` (string): Content key

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

### Page Management

#### GET /api/admin/pages

Get all pages with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status ("draft" | "published")
- `search` (string): Search by title

**Response:**
```json
{
  "pages": [
    {
      "id": "page-1",
      "title": "About Us",
      "slug": "about-us",
      "status": "published",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### POST /api/admin/pages

Create new page.

**Request:**
```json
{
  "title": "New Page",
  "slug": "new-page",
  "content": "<p>Page content...</p>",
  "metaTitle": "New Page - BS3DCrafts",
  "metaDescription": "Description of the new page",
  "keywords": "keyword1, keyword2",
  "status": "draft"
}
```

**Response:**
```json
{
  "id": "page-2",
  "title": "New Page",
  "slug": "new-page",
  "content": "<p>Page content...</p>",
  "metaTitle": "New Page - BS3DCrafts",
  "metaDescription": "Description of the new page",
  "keywords": "keyword1, keyword2",
  "status": "draft",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Validation Errors:**
- Title required (max 200 characters)
- Slug must be unique and URL-safe
- Meta title max 60 characters
- Meta description max 160 characters

#### PUT /api/admin/pages/:id

Update existing page.

**Parameters:**
- `id` (string): Page ID

**Request:** Same as POST

**Response:** Updated page object

#### DELETE /api/admin/pages/:id

Delete page.

**Parameters:**
- `id` (string): Page ID

**Response:**
```json
{
  "success": true,
  "message": "Page deleted successfully"
}
```

### Media Management

#### GET /api/admin/media

Get all media files with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Filter by type ("image" | "3d")
- `search` (string): Search by filename

**Response:**
```json
{
  "media": [
    {
      "id": "media-1",
      "filename": "product-image.jpg",
      "url": "https://cdn.supabase.co/products/product-image.jpg",
      "type": "image",
      "size": 1024000,
      "dimensions": "800x600",
      "usageCount": 3,
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### POST /api/admin/media

Upload media file.

**Request:** multipart/form-data
```
Content-Type: multipart/form-data

file: [binary file data]
```

**Response:**
```json
{
  "id": "media-2",
  "filename": "new-image.jpg",
  "url": "https://cdn.supabase.co/products/new-image.jpg",
  "type": "image",
  "size": 2048000,
  "dimensions": "1200x800",
  "usageCount": 0,
  "uploadedAt": "2024-01-15T10:35:00Z"
}
```

**Validation:**
- File type: JPEG, PNG, WebP, GIF
- Max size: 5MB
- Filename sanitization applied

#### DELETE /api/admin/media/:id

Delete media file.

**Parameters:**
- `id` (string): Media ID

**Response:**
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "warning": "File was used in 3 locations"
}
```

**Error Responses:**
- `409` - File is in use (with usage details)

### Product Management

#### GET /api/admin/products

Get all products with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `category` (string): Filter by category
- `search` (string): Search by name

**Response:**
```json
{
  "products": [
    {
      "id": "product-1",
      "name": "Custom 3D Print",
      "slug": "custom-3d-print",
      "price": 29.99,
      "discountedPrice": 24.99,
      "stock": 15,
      "category": "Custom Prints",
      "status": "published",
      "featured": true,
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

#### POST /api/admin/products

Create new product.

**Request:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 39.99,
  "discountedPrice": 34.99,
  "stock": 10,
  "category": "Custom Prints",
  "material": "PLA",
  "printTimeEstimate": "2-3 hours",
  "weight": 0.5,
  "featured": false,
  "status": "draft"
}
```

**Response:** Created product object

#### PUT /api/admin/products/:id

Update existing product.

**Parameters:**
- `id` (string): Product ID

**Request:** Same as POST

**Response:** Updated product object

#### PUT /api/admin/products/:id/status

Update product status.

**Parameters:**
- `id` (string): Product ID

**Request:**
```json
{
  "status": "published"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product status updated"
}
```

#### POST /api/admin/products/bulk-delete

Delete multiple products.

**Request:**
```json
{
  "productIds": ["product-1", "product-2", "product-3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 products deleted successfully"
}
```

#### POST /api/admin/products/bulk-update

Update multiple products.

**Request:**
```json
{
  "productIds": ["product-1", "product-2"],
  "updates": {
    "category": "New Category",
    "status": "published"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 products updated successfully"
}
```

### Order Management

#### GET /api/admin/orders

Get all orders with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `search` (string): Search by customer name, email, or order ID

**Response:**
```json
{
  "orders": [
    {
      "id": "order-1",
      "orderNumber": "ORD-001",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "total": 89.97,
      "status": "paid",
      "createdAt": "2024-01-15T10:00:00Z",
      "items": [
        {
          "productName": "Custom 3D Print",
          "quantity": 2,
          "price": 29.99
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 75,
    "pages": 4
  }
}
```

#### GET /api/admin/orders/:id

Get order details.

**Parameters:**
- `id` (string): Order ID

**Response:**
```json
{
  "id": "order-1",
  "orderNumber": "ORD-001",
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "ST",
    "zipCode": "12345",
    "country": "USA"
  },
  "items": [
    {
      "id": "item-1",
      "productId": "product-1",
      "productName": "Custom 3D Print",
      "quantity": 2,
      "price": 29.99,
      "total": 59.98
    }
  ],
  "subtotal": 59.98,
  "shipping": 9.99,
  "tax": 5.25,
  "total": 75.22,
  "status": "paid",
  "trackingNumber": null,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### PUT /api/admin/orders/:id/status

Update order status.

**Parameters:**
- `id` (string): Order ID

**Request:**
```json
{
  "status": "shipped",
  "trackingNumber": "1Z999AA1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated and customer notified"
}
```

**Validation:**
- Tracking number required when status is "shipped"

### Settings Management

#### GET /api/admin/settings

Get all settings grouped by category.

**Response:**
```json
{
  "general": {
    "siteTitle": "BS3DCrafts",
    "tagline": "Precision in Every Layer",
    "metaDescription": "Custom 3D printing services",
    "defaultKeywords": "3d printing, custom prints"
  },
  "contact": {
    "email": "info@bs3dcrafts.com",
    "phone": "+1-555-0123",
    "whatsappNumber": "+1-555-0123",
    "address": "123 Maker Street, Tech City, TC 12345"
  },
  "social": {
    "instagram": "https://instagram.com/bs3dcrafts",
    "twitter": "https://twitter.com/bs3dcrafts",
    "facebook": "https://facebook.com/bs3dcrafts",
    "linkedin": "https://linkedin.com/company/bs3dcrafts"
  },
  "email": {
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587",
    "smtpUser": "noreply@bs3dcrafts.com",
    "fromName": "BS3DCrafts"
  },
  "analytics": {
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "facebookPixelId": "123456789"
  },
  "features": {
    "newsletter": "true",
    "whatsappButton": "true",
    "testimonials": "true"
  }
}
```

#### PUT /api/admin/settings

Update multiple settings.

**Request:**
```json
{
  "settings": {
    "siteTitle": "Updated Site Title",
    "tagline": "New Tagline",
    "contactEmail": "newemail@bs3dcrafts.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "updated": ["siteTitle", "tagline", "contactEmail"]
}
```

**Validation:**
- Email addresses must be valid format
- URLs must be valid format
- Required fields cannot be empty

#### POST /api/admin/settings/reset

Reset setting to default value.

**Request:**
```json
{
  "key": "siteTitle"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Setting reset to default value",
  "key": "siteTitle",
  "value": "BS3DCrafts"
}
```

### Navigation Management

#### GET /api/admin/navigation

Get all navigation items.

**Response:**
```json
{
  "header": [
    {
      "id": "nav-1",
      "type": "header",
      "label": "Products",
      "url": "/products",
      "parentId": null,
      "order": 1,
      "children": [
        {
          "id": "nav-1-1",
          "type": "header",
          "label": "3D Prints",
          "url": "/products/3d-prints",
          "parentId": "nav-1",
          "order": 1
        }
      ]
    }
  ],
  "footer": [
    {
      "id": "footer-1",
      "type": "footer",
      "label": "About",
      "url": "/about",
      "parentId": null,
      "order": 1
    }
  ]
}
```

#### POST /api/admin/navigation

Create navigation item.

**Request:**
```json
{
  "type": "header",
  "label": "New Menu Item",
  "url": "/new-page",
  "parentId": null,
  "order": 5
}
```

**Response:**
```json
{
  "id": "nav-5",
  "type": "header",
  "label": "New Menu Item",
  "url": "/new-page",
  "parentId": null,
  "order": 5,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Validation:**
- Maximum 2 levels deep (parent > child)
- Parent must exist if parentId provided
- URL must be valid format

#### PUT /api/admin/navigation/:id

Update navigation item.

**Parameters:**
- `id` (string): Navigation item ID

**Request:** Same as POST

**Response:** Updated navigation item

#### DELETE /api/admin/navigation/:id

Delete navigation item.

**Parameters:**
- `id` (string): Navigation item ID

**Response:**
```json
{
  "success": true,
  "message": "Navigation item and children deleted successfully"
}
```

**Note:** Deleting a parent item will cascade delete all children.

## Webhooks

### Order Status Updates

When order status changes, a webhook can be triggered to external services.

**Webhook URL:** Configured in settings

**Payload:**
```json
{
  "event": "order.status_updated",
  "orderId": "order-1",
  "oldStatus": "paid",
  "newStatus": "shipped",
  "trackingNumber": "1Z999AA1234567890",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize API client
const api = new BS3DCraftsAPI({
  baseURL: 'https://bs3dcrafts.com/api',
  credentials: 'include' // For session cookies
});

// Fetch homepage content
const homepage = await api.get('/content/homepage');

// Admin login
await api.post('/admin/login', {
  email: 'admin@bs3dcrafts.com',
  password: 'password'
});

// Create new page
const page = await api.post('/admin/pages', {
  title: 'New Page',
  content: '<p>Content</p>',
  status: 'draft'
});
```

### cURL Examples

```bash
# Get homepage content
curl https://bs3dcrafts.com/api/content/homepage

# Admin login
curl -X POST https://bs3dcrafts.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bs3dcrafts.com","password":"password"}' \
  -c cookies.txt

# Create page (with session cookie)
curl -X POST https://bs3dcrafts.com/api/admin/pages \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: abc123" \
  -b cookies.txt \
  -d '{"title":"New Page","content":"<p>Content</p>","status":"draft"}'
```

## Testing

### Test Endpoints

Development environment includes test endpoints:

- `GET /api/test/reset-db` - Reset database to initial state
- `GET /api/test/seed-data` - Seed test data
- `GET /api/test/health` - Health check

### Rate Limit Testing

Test rate limiting with rapid requests:

```bash
# Test public endpoint rate limit
for i in {1..105}; do
  curl https://bs3dcrafts.com/api/content/homepage
done
```

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Public content endpoints
- Admin authentication and CRUD operations
- Media upload and management
- Order management
- Settings configuration

---

**Support**: For API support, contact the development team or refer to the CMS User Guide for additional information.