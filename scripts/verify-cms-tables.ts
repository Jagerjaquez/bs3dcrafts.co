import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTables() {
  console.log('🔍 Verifying CMS tables...\n')

  try {
    // Check SiteContent table
    const siteContentCount = await prisma.siteContent.count()
    console.log('✅ SiteContent table exists (count:', siteContentCount, ')')

    // Check Page table
    const pageCount = await prisma.page.count()
    console.log('✅ Page table exists (count:', pageCount, ')')

    // Check Media table
    const mediaCount = await prisma.media.count()
    console.log('✅ Media table exists (count:', mediaCount, ')')

    // Check Settings table
    const settingsCount = await prisma.settings.count()
    console.log('✅ Settings table exists (count:', settingsCount, ')')

    // Check Navigation table
    const navigationCount = await prisma.navigation.count()
    console.log('✅ Navigation table exists (count:', navigationCount, ')')

    // Check Product status field
    const products = await prisma.product.findMany({
      select: { id: true, status: true },
      take: 1
    })
    console.log('✅ Product.status field exists')

    console.log('\n✨ All CMS tables and fields verified successfully!')
    console.log('\n📊 Database Schema Summary:')
    console.log('   - SiteContent: Dynamic content sections')
    console.log('   - Page: Dynamic pages with SEO')
    console.log('   - Media: Media library')
    console.log('   - Settings: Site-wide configuration')
    console.log('   - Navigation: Header/footer menus')
    console.log('   - Product.status: Draft/published status')

  } catch (error) {
    console.error('❌ Error verifying tables:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTables()
