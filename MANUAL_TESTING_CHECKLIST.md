# Manual Testing Checklist - Full Admin CMS

## Testing Environment
- **Application URL**: http://localhost:3000
- **Admin Panel URL**: http://localhost:3000/admin
- **Test Date**: $(date)
- **Build Status**: ✅ Successful

## 1. Admin Authentication & Security Testing

### 1.1 Admin Login
- [ ] Navigate to `/admin/login`
- [ ] Test with invalid credentials - should show error
- [ ] Test with valid admin credentials - should redirect to dashboard
- [ ] Verify session persistence after page refresh
- [ ] Test logout functionality

### 1.2 Session Management
- [ ] Verify admin routes are protected (redirect to login when not authenticated)
- [ ] Test session expiration (24 hours)
- [ ] Verify CSRF token is present in forms
- [ ] Test CSRF protection on admin API endpoints

### 1.3 Rate Limiting
- [ ] Test rate limiting on login endpoint (5 attempts per 15 min)
- [ ] Test rate limiting on admin API endpoints (200 requests per minute)
- [ ] Test rate limiting on public API endpoints (100 requests per minute)

## 2. Admin Dashboard Testing

### 2.1 Dashboard Metrics
- [ ] Verify total products count is accurate
- [ ] Verify orders by status counts are accurate
- [ ] Verify total users count is accurate
- [ ] Check recent activity feed shows last 5 changes
- [ ] Verify quick action buttons work
- [ ] Check system status indicators

### 2.2 Dashboard Auto-refresh
- [ ] Verify dashboard refreshes every 5 minutes
- [ ] Make a change (add product) and verify it appears in recent activity

## 3. Content Management Testing

### 3.1 Homepage Content Editor
- [ ] Navigate to `/admin/content/homepage`
- [ ] Edit hero section (title, description, button text, button URL)
- [ ] Upload and replace hero background image
- [ ] Add/edit/remove carousel items
- [ ] Reorder carousel items using drag-and-drop
- [ ] Add/edit/remove testimonials
- [ ] Edit statistics section
- [ ] Edit newsletter section
- [ ] Save changes and verify they appear on homepage

### 3.2 Navigation Editor
- [ ] Navigate to `/admin/content/navigation`
- [ ] Add new header navigation item
- [ ] Add nested navigation item (dropdown)
- [ ] Reorder navigation items
- [ ] Edit existing navigation item
- [ ] Delete navigation item
- [ ] Verify changes appear in site header

### 3.3 Branding Editor
- [ ] Navigate to `/admin/content/branding`
- [ ] Upload and replace site logo
- [ ] Edit footer content
- [ ] Edit social media links
- [ ] Edit contact information
- [ ] Verify changes appear in site footer

## 4. Page Management Testing

### 4.1 Page List
- [ ] Navigate to `/admin/pages`
- [ ] Verify all pages are listed with correct status
- [ ] Test search by title functionality
- [ ] Test filter by status (draft/published)
- [ ] Test pagination if many pages exist

### 4.2 Page Editor
- [ ] Click "New Page" button
- [ ] Create new page with title, content, SEO fields
- [ ] Verify slug auto-generation from title
- [ ] Test rich text editor features:
  - [ ] Bold, italic, underline formatting
  - [ ] Headings (H1-H6)
  - [ ] Lists (ordered and unordered)
  - [ ] Links with URL and title
  - [ ] Image insertion
  - [ ] Blockquotes and code blocks
  - [ ] Tables
  - [ ] Undo/redo functionality
- [ ] Test auto-save every 30 seconds
- [ ] Test preview mode
- [ ] Save as draft and verify status
- [ ] Publish page and verify it's accessible at `/[slug]`

### 4.3 Page SEO
- [ ] Test meta title character counter (60 chars)
- [ ] Test meta description character counter (160 chars)
- [ ] Verify warnings for exceeded lengths
- [ ] Test keywords field

## 5. Product Management Testing

### 5.1 Product Form
- [ ] Navigate to `/admin/products/new`
- [ ] Fill all product fields (name, description, price, stock, etc.)
- [ ] Test drag-and-drop image upload
- [ ] Upload multiple images
- [ ] Reorder images by dragging
- [ ] Delete individual images
- [ ] Verify stock warning indicator (below 5 units)
- [ ] Test status selector (draft/published)
- [ ] Save product and verify it appears in product list

### 5.2 Product List & Bulk Operations
- [ ] Navigate to `/admin/products`
- [ ] Test search functionality
- [ ] Test category filter
- [ ] Select multiple products with checkboxes
- [ ] Test bulk delete with confirmation dialog
- [ ] Test bulk category update
- [ ] Test bulk status change

### 5.3 Quick Edit Mode
- [ ] Test inline editing for price and stock
- [ ] Verify changes save without full form
- [ ] Check loading state during save

## 6. Media Library Testing

### 6.1 Media Grid
- [ ] Navigate to `/admin/media`
- [ ] Verify all media displayed in grid with thumbnails
- [ ] Test search by filename
- [ ] Test filter by type and upload date
- [ ] Hover over media to see metadata

### 6.2 Media Upload
- [ ] Click upload button to open modal
- [ ] Test drag-and-drop file upload
- [ ] Test multiple file selection
- [ ] Verify upload progress display
- [ ] Test file type validation (JPEG, PNG, WebP, GIF)
- [ ] Test file size validation (max 5MB)
- [ ] Verify success notification after upload

### 6.3 Media Management
- [ ] Test media deletion
- [ ] Verify usage count and warning if in use
- [ ] Test media selector component in other forms

## 7. Settings Panel Testing

### 7.1 Settings Categories
- [ ] Navigate to `/admin/settings`
- [ ] Test all category tabs (General, Contact, Social, Email, Analytics, Features)
- [ ] Edit site title and tagline
- [ ] Edit contact information
- [ ] Edit social media links
- [ ] Test URL and email validation
- [ ] Test feature toggles (newsletter, WhatsApp button, testimonials)
- [ ] Test reset button per setting

## 8. Order Management Testing

### 8.1 Order List
- [ ] Navigate to `/admin/orders`
- [ ] Verify all orders displayed with correct information
- [ ] Test status filter dropdown
- [ ] Test search by customer name, email, order ID
- [ ] Verify order statistics display

### 8.2 Order Detail & Status Update
- [ ] Click on an order to view details
- [ ] Verify customer info, items, pricing, shipping address
- [ ] Test status update with dropdown
- [ ] Test tracking number requirement when status is "shipped"
- [ ] Verify email notification is sent on status change

## 9. Public Content API Testing

### 9.1 Homepage Content API
- [ ] Test GET `/api/content/homepage`
- [ ] Verify response includes hero, carousel, testimonials, stats
- [ ] Check response caching (5 minutes)

### 9.2 Navigation API
- [ ] Test GET `/api/content/navigation`
- [ ] Verify hierarchical structure (parent-child)
- [ ] Check response caching (5 minutes)

### 9.3 Dynamic Pages API
- [ ] Test GET `/api/content/pages/[slug]`
- [ ] Verify only published pages are returned
- [ ] Test 404 for non-existent or draft pages
- [ ] Check response caching (5 minutes)

### 9.4 Settings API
- [ ] Test GET `/api/content/settings`
- [ ] Verify public settings only (no sensitive data)
- [ ] Check response caching (10 minutes)

## 10. Frontend Integration Testing

### 10.1 Homepage Dynamic Content
- [ ] Visit homepage (`/`)
- [ ] Verify hero section displays dynamic content
- [ ] Verify carousel displays dynamic items
- [ ] Verify testimonials display dynamic content
- [ ] Verify stats display dynamic numbers
- [ ] Test loading skeletons while fetching data

### 10.2 Dynamic Navigation
- [ ] Verify header navigation displays dynamic menu items
- [ ] Test dropdown menus for nested items
- [ ] Verify footer navigation displays dynamic links
- [ ] Test mobile menu functionality

### 10.3 Dynamic Pages
- [ ] Visit a dynamic page (e.g., `/about`)
- [ ] Verify page content displays correctly
- [ ] Verify SEO meta tags are rendered
- [ ] Test 404 page for non-existent pages

### 10.4 Site Settings Integration
- [ ] Verify site title displays in header
- [ ] Verify logo displays in header
- [ ] Verify contact info displays in footer
- [ ] Verify social links display in footer
- [ ] Test WhatsApp button visibility based on settings

## 11. Performance Testing

### 11.1 Loading Performance
- [ ] Test homepage load time (should be under 3 seconds)
- [ ] Test admin panel load time
- [ ] Test image loading with lazy loading
- [ ] Verify loading skeletons display during data fetch

### 11.2 Caching
- [ ] Verify API responses are cached
- [ ] Test cache invalidation after content updates
- [ ] Verify client-side caching with SWR/React Query

## 12. Security Testing

### 12.1 Input Validation
- [ ] Test XSS prevention in rich text editor
- [ ] Test SQL injection prevention in search fields
- [ ] Test file upload validation (type, size)
- [ ] Test HTML sanitization in content fields

### 12.2 Authentication & Authorization
- [ ] Test admin route protection
- [ ] Test API endpoint authentication
- [ ] Test CSRF token validation
- [ ] Test session timeout

### 12.3 Audit Logging
- [ ] Verify admin actions are logged
- [ ] Check authentication attempts are logged
- [ ] Verify content modifications are logged

## 13. Error Handling Testing

### 13.1 API Error Handling
- [ ] Test network errors (disconnect internet)
- [ ] Test server errors (500 responses)
- [ ] Test validation errors (400 responses)
- [ ] Verify user-friendly error messages

### 13.2 Form Error Handling
- [ ] Test required field validation
- [ ] Test format validation (email, URL)
- [ ] Test file upload errors
- [ ] Verify error messages are clear and actionable

## 14. Mobile Responsiveness Testing

### 14.1 Admin Panel Mobile
- [ ] Test admin panel on tablet (768px minimum width)
- [ ] Verify sidebar navigation works on mobile
- [ ] Test form usability on mobile devices
- [ ] Test image upload on mobile

### 14.2 Frontend Mobile
- [ ] Test homepage on mobile devices
- [ ] Test navigation menu on mobile
- [ ] Test dynamic pages on mobile
- [ ] Verify responsive images

## Issues Found

### Critical Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Minor Issues
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

### Recommendations
- [ ] Recommendation 1: [Description]
- [ ] Recommendation 2: [Description]

## Test Summary

- **Total Test Cases**: [Count]
- **Passed**: [Count]
- **Failed**: [Count]
- **Critical Issues**: [Count]
- **Minor Issues**: [Count]

## Sign-off

- **Tester**: [Name]
- **Date**: [Date]
- **Status**: [Pass/Fail/Pass with Issues]