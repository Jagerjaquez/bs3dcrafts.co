#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates a backup of all CMS content before deployment
 */

const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createBackup() {
  try {
    console.log('🔄 Creating database backup...')
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      sections: {}
    }

    // Export site content
    console.log('📄 Exporting site content...')
    const siteContent = await prisma.siteContent.findMany({
      orderBy: { key: 'asc' }
    })
    exportData.sections.content = siteContent
    console.log(`   ✅ ${siteContent.length} content items`)

    // Export pages
    console.log('📝 Exporting pages...')
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' }
    })
    exportData.sections.pages = pages
    console.log(`   ✅ ${pages.length} pages`)

    // Export products
    console.log('🛍️ Exporting products...')
    const products = await prisma.product.findMany({
      include: {
        media: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    exportData.sections.products = products
    console.log(`   ✅ ${products.length} products`)

    // Export settings
    console.log('⚙️ Exporting settings...')
    const settings = await prisma.settings.findMany({
      orderBy: { category: 'asc' }
    })
    exportData.sections.settings = settings
    console.log(`   ✅ ${settings.length} settings`)

    // Export navigation
    console.log('🧭 Exporting navigation...')
    const navigation = await prisma.navigation.findMany({
      orderBy: [{ type: 'asc' }, { order: 'asc' }]
    })
    exportData.sections.navigation = navigation
    console.log(`   ✅ ${navigation.length} navigation items`)

    // Export media
    console.log('🖼️ Exporting media...')
    const media = await prisma.media.findMany({
      orderBy: { uploadedAt: 'desc' }
    })
    exportData.sections.media = media
    console.log(`   ✅ ${media.length} media items`)

    // Save backup file
    const backupDir = path.join(__dirname, '..', 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const filename = `bs3dcrafts-backup-${new Date().toISOString().split('T')[0]}.json`
    const filepath = path.join(backupDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2))
    
    console.log(`\n✅ Backup created successfully!`)
    console.log(`📁 File: ${filepath}`)
    console.log(`📊 Size: ${(fs.statSync(filepath).size / 1024).toFixed(1)} KB`)
    
    // Create restore instructions
    const restoreInstructions = `
# Database Restore Instructions

## To restore this backup:

1. **Using the Admin Panel:**
   - Go to /admin/backup
   - Upload the backup file: ${filename}
   - Preview changes and confirm import

2. **Using the API:**
   \`\`\`bash
   curl -X POST http://localhost:3000/api/admin/import \\
     -H "Content-Type: multipart/form-data" \\
     -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \\
     -F "file=@${filename}"
   \`\`\`

3. **Using the import script:**
   \`\`\`bash
   node scripts/restore-backup.js ${filename}
   \`\`\`

## Backup Contents:
- Site Content: ${siteContent.length} items
- Pages: ${pages.length} items  
- Products: ${products.length} items
- Settings: ${settings.length} items
- Navigation: ${navigation.length} items
- Media: ${media.length} items

## Created: ${new Date().toISOString()}
## Version: 1.0
`

    fs.writeFileSync(
      path.join(backupDir, `${filename.replace('.json', '-restore-instructions.md')}`),
      restoreInstructions
    )

    console.log(`📋 Restore instructions: ${filename.replace('.json', '-restore-instructions.md')}`)
    
    return filepath

  } catch (error) {
    console.error('❌ Backup failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run backup if called directly
if (require.main === module) {
  createBackup()
    .then((filepath) => {
      console.log('\n🎉 Backup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Backup failed:', error.message)
      process.exit(1)
    })
}

module.exports = { createBackup }