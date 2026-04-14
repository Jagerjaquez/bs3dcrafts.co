#!/usr/bin/env node

/**
 * Production Database Verification Script
 * Verifies all required tables exist and have data
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying production database...')
    console.log('')

    // Check each table
    const tables = [
      { name: 'Product', model: prisma.product },
      { name: 'ProductMedia', model: prisma.productMedia },
      { name: 'Order', model: prisma.order },
      { name: 'OrderItem', model: prisma.orderItem },
      { name: 'User', model: prisma.user },
      { name: 'SiteContent', model: prisma.siteContent },
      { name: 'Page', model: prisma.page },
      { name: 'Settings', model: prisma.settings },
      { name: 'Navigation', model: prisma.navigation },
      { name: 'Media', model: prisma.media },
    ]

    const results = []

    for (const table of tables) {
      try {
        const count = await table.model.count()
        console.log(`✅ ${table.name}: ${count} records`)
        results.push({ table: table.name, count, status: 'OK' })
      } catch (error) {
        console.log(`❌ ${table.name}: Error - ${error.message}`)
        results.push({ table: table.name, count: 0, status: 'ERROR', error: error.message })
      }
    }

    console.log('')
    console.log('📊 Database Summary:')
    console.log('===================')
    
    const totalTables = results.length
    const successfulTables = results.filter(r => r.status === 'OK').length
    const totalRecords = results.reduce((sum, r) => sum + r.count, 0)

    console.log(`Tables: ${successfulTables}/${totalTables} accessible`)
    console.log(`Total records: ${totalRecords}`)

    if (successfulTables === totalTables) {
      console.log('')
      console.log('🎉 Database verification successful!')
      console.log('All required tables exist and are accessible.')
      
      // Check for essential data
      const products = await prisma.product.count()
      const settings = await prisma.settings.count()
      const pages = await prisma.page.count()
      
      console.log('')
      console.log('📋 Essential Data Check:')
      console.log(`Products: ${products} ${products > 0 ? '✅' : '⚠️  (Consider adding sample products)'}`)
      console.log(`Settings: ${settings} ${settings > 0 ? '✅' : '⚠️  (Consider running seed script)'}`)
      console.log(`Pages: ${pages} ${pages > 0 ? '✅' : '⚠️  (Consider adding default pages)'}`)
      
      return true
    } else {
      console.log('')
      console.log('❌ Database verification failed!')
      console.log('Some tables are not accessible.')
      return false
    }

  } catch (error) {
    console.error('💥 Database verification error:', error.message)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification if called directly
if (require.main === module) {
  verifyDatabase()
    .then((success) => {
      process.exit(success ? 0 : 1)
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error.message)
      process.exit(1)
    })
}

module.exports = { verifyDatabase }