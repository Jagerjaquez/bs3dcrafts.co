import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyIndexes() {
  console.log('🔍 Verifying CMS indexes...\n')

  try {
    // Query to check indexes on CMS tables
    const indexes = await prisma.$queryRaw<Array<{
      tablename: string
      indexname: string
      indexdef: string
    }>>`
      SELECT 
        tablename, 
        indexname, 
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('SiteContent', 'Page', 'Media', 'Settings', 'Navigation', 'Product')
      ORDER BY tablename, indexname
    `

    console.log('📋 Database Indexes:\n')
    
    const tableIndexes: Record<string, string[]> = {}
    
    indexes.forEach(idx => {
      if (!tableIndexes[idx.tablename]) {
        tableIndexes[idx.tablename] = []
      }
      tableIndexes[idx.tablename].push(idx.indexname)
    })

    // Expected indexes per table
    const expectedIndexes = {
      SiteContent: ['SiteContent_key_idx', 'SiteContent_section_idx'],
      Page: ['Page_slug_idx', 'Page_status_idx'],
      Media: ['Media_type_idx', 'Media_uploadedAt_idx'],
      Settings: ['Settings_key_idx', 'Settings_category_idx'],
      Navigation: ['Navigation_type_idx', 'Navigation_parentId_idx', 'Navigation_order_idx'],
      Product: ['Product_status_idx']
    }

    let allIndexesPresent = true

    for (const [table, expectedIdxs] of Object.entries(expectedIndexes)) {
      console.log(`\n${table}:`)
      const actualIndexes = tableIndexes[table] || []
      
      expectedIdxs.forEach(expectedIdx => {
        const found = actualIndexes.some(idx => idx.includes(expectedIdx.replace(/_idx$/, '')))
        if (found) {
          console.log(`  ✅ ${expectedIdx}`)
        } else {
          console.log(`  ❌ ${expectedIdx} - MISSING`)
          allIndexesPresent = false
        }
      })
    }

    if (allIndexesPresent) {
      console.log('\n\n✨ All required indexes verified successfully!')
    } else {
      console.log('\n\n⚠️  Some indexes are missing!')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Error verifying indexes:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyIndexes()
