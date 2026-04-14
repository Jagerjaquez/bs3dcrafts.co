# BS3DCrafts CMS User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Content Management](#content-management)
4. [Page Management](#page-management)
5. [Media Library](#media-library)
6. [Product Management](#product-management)
7. [Order Management](#order-management)
8. [Settings](#settings)
9. [SEO Best Practices](#seo-best-practices)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Admin Panel

1. Navigate to `/admin/login` on your site
2. Enter your admin credentials
3. You'll be redirected to the dashboard upon successful login

### Admin Panel Layout

The admin panel features a sidebar navigation with the following sections:
- **Dashboard**: Overview metrics and quick actions
- **Content**: Homepage sections, navigation, and branding
- **Pages**: Dynamic page management
- **Media**: Image and file library
- **Products**: Product catalog management
- **Orders**: Order processing and tracking
- **Settings**: Site-wide configuration

## Dashboard Overview

The dashboard provides a comprehensive overview of your site:

### Key Metrics
- **Total Products**: Count of published products
- **Orders by Status**: Breakdown of pending, paid, shipped, and completed orders
- **Total Users**: Registered customer count
- **Recent Activity**: Last 5 content modifications

### Quick Actions
- Add new product
- View recent orders
- Manage pages
- Upload media

### System Status
- Database connection status
- CDN status
- API health indicators

The dashboard auto-refreshes every 5 minutes to keep metrics current.

## Content Management

### Homepage Content Editor

Access: **Content > Homepage**

#### Hero Section
- **Title**: Main headline (recommended: 40-60 characters)
- **Description**: Supporting text (recommended: 120-160 characters)
- **Button Text**: Call-to-action text
- **Button URL**: Link destination
- **Background Image**: Upload hero background (recommended: 1920x1080px)

#### Carousel/Slider Management
- **Add Items**: Click "Add Carousel Item"
- **Reorder**: Drag items to change display order
- **Edit**: Click on any item to modify
- **Remove**: Use the delete button on each item

Each carousel item includes:
- Image (recommended: 800x600px)
- Title
- Description
- Link URL

#### Testimonials
- **Customer Name**: Full name
- **Role/Company**: Customer's position or company
- **Comment**: Testimonial text (recommended: 100-200 characters)
- **Rating**: 1-5 stars
- **Avatar**: Customer photo (recommended: 150x150px)

#### Statistics Section
- **Numbers**: Numeric values (e.g., 1000, 50, 25)
- **Labels**: Descriptive text (e.g., "Happy Customers", "Projects Completed")

#### Newsletter Section
- **Title**: Section heading
- **Description**: Explanatory text
- **Enable/Disable**: Toggle newsletter signup visibility

### Navigation Management

Access: **Content > Navigation**

#### Header Navigation
- **Add Menu Items**: Click "Add Header Item"
- **Nested Menus**: Create dropdowns by setting a parent item
- **Maximum Depth**: 2 levels (parent > child)
- **Reordering**: Drag items to change menu order

#### Footer Navigation
- **Column Organization**: Group related links
- **Social Links**: Add social media profiles
- **Contact Information**: Display business details

### Branding Management

Access: **Content > Branding**

#### Logo Management
- **Upload Logo**: Recommended formats: PNG, SVG
- **Size Guidelines**: Maximum 200px height for header
- **Preview**: See how logo appears on site

#### Footer Content
- **Company Description**: Brief about section
- **Contact Details**: Phone, email, address
- **Social Media Links**: Instagram, Twitter, Facebook, LinkedIn

## Page Management

Access: **Pages**

### Creating New Pages

1. Click "New Page"
2. Fill in required fields:
   - **Title**: Page headline
   - **Slug**: URL identifier (auto-generated from title)
   - **Content**: Rich text content
   - **SEO Fields**: Meta title, description, keywords

### Rich Text Editor Features

The editor supports:
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headings**: H1 through H6
- **Lists**: Ordered and unordered
- **Links**: Internal and external
- **Images**: Insert from media library
- **Tables**: Create data tables
- **Code Blocks**: For technical content
- **Blockquotes**: For highlighted text

### Page Status Management

- **Draft**: Page is saved but not visible to visitors
- **Published**: Page is live and accessible via its URL

### SEO Optimization

- **Meta Title**: 50-60 characters (displays in search results)
- **Meta Description**: 150-160 characters (search result snippet)
- **Keywords**: Comma-separated relevant terms
- **URL Slug**: Keep short, descriptive, and hyphenated

### Auto-Save Feature

Content is automatically saved every 30 seconds to prevent data loss.

## Media Library

Access: **Media**

### Uploading Files

#### Supported Formats
- **Images**: JPEG, PNG, WebP, GIF
- **Maximum Size**: 5MB per file
- **Recommended Dimensions**: 
  - Product images: 800x800px
  - Hero images: 1920x1080px
  - Thumbnails: 300x300px

#### Upload Methods
1. **Drag and Drop**: Drag files directly into the upload area
2. **File Browser**: Click "Upload" and select files
3. **Bulk Upload**: Select multiple files at once

### Image Optimization

The system automatically generates:
- **Thumbnail**: 150x150px
- **Medium**: 600x600px  
- **Large**: 1200x1200px

All images are optimized for web delivery through the CDN.

### Media Management

#### Search and Filter
- **Search**: Find files by filename
- **Filter by Type**: Images, documents, etc.
- **Filter by Date**: Upload date ranges

#### Usage Tracking
- View where each image is used
- Warning before deleting images in use
- Usage count display

#### Media Selector
When adding images to content:
1. Click "Select Image"
2. Choose from existing media or upload new
3. Select desired image size
4. Add alt text for accessibility

## Product Management

Access: **Products**

### Adding New Products

1. Click "New Product"
2. Fill in product details:
   - **Name**: Product title
   - **Description**: Detailed product information
   - **Price**: Regular price
   - **Discounted Price**: Sale price (optional)
   - **Stock**: Available quantity
   - **Category**: Product classification
   - **Material**: Manufacturing material
   - **Print Time**: Estimated production time
   - **Weight**: Shipping weight

### Image Management

#### Upload Process
1. **Drag and Drop**: Drag images into the upload zone
2. **Multiple Images**: Upload several product photos
3. **Reorder**: Drag images to change display order
4. **Primary Image**: First image becomes the main product photo

#### Image Guidelines
- **Format**: JPEG or PNG
- **Size**: Minimum 800x800px
- **Quality**: High resolution for zoom functionality
- **Angles**: Multiple views (front, back, detail shots)

### Product Status

- **Draft**: Product saved but not visible to customers
- **Published**: Product live on the website

### Stock Management

- **Low Stock Warning**: Alert when inventory drops below 5 units
- **Stock Tracking**: Automatic inventory updates with orders
- **Quick Edit**: Update price and stock directly from product list

### Bulk Operations

Select multiple products to:
- **Bulk Delete**: Remove multiple products
- **Update Category**: Change category for selected products
- **Change Status**: Publish or unpublish multiple products

## Order Management

Access: **Orders**

### Order Overview

View all orders with:
- **Order ID**: Unique identifier
- **Customer**: Name and email
- **Date**: Order placement date
- **Total**: Order value
- **Status**: Current order state

### Order Status Management

#### Status Options
- **Pending**: Order placed, payment pending
- **Paid**: Payment confirmed
- **Shipped**: Order dispatched
- **Completed**: Order delivered
- **Cancelled**: Order cancelled

#### Status Updates
1. Click on order to view details
2. Select new status from dropdown
3. Add tracking number (required for "Shipped" status)
4. Customer receives automatic email notification

### Order Details

Each order shows:
- **Customer Information**: Name, email, phone
- **Shipping Address**: Delivery location
- **Order Items**: Products, quantities, prices
- **Payment Details**: Total, taxes, shipping
- **Order Timeline**: Status change history

### Search and Filtering

- **Search**: Find orders by customer name, email, or order ID
- **Filter by Status**: View orders by current status
- **Date Range**: Filter by order date

## Settings

Access: **Settings**

### General Settings

- **Site Title**: Appears in browser title and search results
- **Tagline**: Brief site description
- **Meta Description**: Default description for SEO
- **Default Keywords**: Site-wide SEO keywords

### Contact Information

- **Email**: Primary contact email
- **Phone**: Business phone number
- **WhatsApp**: WhatsApp business number
- **Address**: Physical business address

### Social Media

- **Instagram**: Profile URL
- **Twitter**: Profile URL
- **Facebook**: Page URL
- **LinkedIn**: Company page URL

### Email Configuration

- **SMTP Server**: Email server settings
- **Sender Email**: From address for system emails
- **Sender Name**: Display name for emails

### Analytics

- **Google Analytics**: GA4 tracking ID
- **Facebook Pixel**: Pixel ID for Facebook ads

### Feature Toggles

Enable or disable:
- **Newsletter Signup**: Homepage newsletter section
- **WhatsApp Button**: Floating WhatsApp contact
- **Testimonials**: Customer testimonials display

### Backup and Restore

- **Export Data**: Download all content as JSON
- **Import Data**: Restore from backup file
- **Automatic Backups**: Daily database backups

## SEO Best Practices

### Page Optimization

#### Title Tags
- **Length**: 50-60 characters
- **Include Keywords**: Primary keyword near the beginning
- **Be Descriptive**: Clearly describe page content
- **Unique**: Each page should have a unique title

#### Meta Descriptions
- **Length**: 150-160 characters
- **Compelling**: Encourage clicks from search results
- **Include Keywords**: Naturally incorporate relevant terms
- **Call to Action**: Include action words when appropriate

#### URL Structure
- **Keep Short**: Concise and descriptive
- **Use Hyphens**: Separate words with hyphens
- **Include Keywords**: Primary keyword in URL
- **Avoid Special Characters**: Stick to letters, numbers, hyphens

### Content Guidelines

#### Headings
- **H1**: One per page, main topic
- **H2-H6**: Organize content hierarchically
- **Include Keywords**: Naturally incorporate relevant terms
- **Descriptive**: Clearly indicate section content

#### Images
- **Alt Text**: Describe image content for accessibility
- **File Names**: Use descriptive, keyword-rich names
- **Optimize Size**: Balance quality and loading speed
- **Relevant**: Images should support content

#### Internal Linking
- **Link to Related Content**: Connect relevant pages
- **Descriptive Anchor Text**: Use meaningful link text
- **Natural Placement**: Links should fit naturally in content

### Technical SEO

#### Site Speed
- **Optimize Images**: Use appropriate formats and sizes
- **Minimize Plugins**: Only use necessary functionality
- **Enable Caching**: Leverage browser and server caching

#### Mobile Optimization
- **Responsive Design**: Ensure mobile-friendly layout
- **Touch-Friendly**: Buttons and links easy to tap
- **Fast Loading**: Optimize for mobile connections

#### Schema Markup
- **Product Schema**: Structured data for products
- **Organization Schema**: Business information
- **Review Schema**: Customer testimonials

## Troubleshooting

### Common Issues

#### Login Problems
- **Forgot Password**: Contact system administrator
- **Session Expired**: Log in again
- **Access Denied**: Verify admin permissions

#### Upload Issues
- **File Too Large**: Reduce file size below 5MB
- **Unsupported Format**: Use JPEG, PNG, WebP, or GIF
- **Upload Failed**: Check internet connection and retry

#### Content Not Updating
- **Cache Delay**: Changes may take up to 5 minutes to appear
- **Clear Browser Cache**: Force refresh with Ctrl+F5
- **Check Status**: Ensure content is published, not draft

#### Performance Issues
- **Slow Loading**: Optimize images and reduce file sizes
- **High Traffic**: Contact hosting provider about resources
- **Database Issues**: Check system status on dashboard

### Getting Help

#### Support Channels
- **Documentation**: Refer to this guide
- **System Status**: Check dashboard indicators
- **Error Messages**: Note exact error text for support

#### Best Practices for Support
- **Describe Issue**: Provide detailed problem description
- **Steps to Reproduce**: List actions that cause the issue
- **Screenshots**: Include relevant screenshots
- **Browser Information**: Specify browser and version

### Maintenance

#### Regular Tasks
- **Content Review**: Regularly update outdated content
- **Image Optimization**: Compress large images
- **SEO Monitoring**: Check search rankings and traffic
- **Backup Verification**: Ensure backups are working

#### Security
- **Strong Passwords**: Use complex admin passwords
- **Regular Updates**: Keep system updated
- **Monitor Activity**: Review audit logs periodically
- **Limit Access**: Only provide admin access when necessary

---

*This guide covers the essential features of the BS3DCrafts CMS. For additional support or advanced features, consult the technical documentation or contact your system administrator.*