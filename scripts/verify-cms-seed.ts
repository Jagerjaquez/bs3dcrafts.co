import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

async function main() {
  console.log('🔍 Verifying CMS seed data...\n')

  // Check Settings
  const settings = await prisma.settings.findMany({
    orderBy: { category: 'asc' }
  })
  console.log(`📝 Settings: ${settings.length} items`)
  console.log('   Categories:', [...new Set(settings.map(s => s.category))].join(', '))
  
  // Check Pages
  const pages = await prisma.page.findMany({
    select: { title: true, slug: true, status: true }
  })
  console.log(`\n📄 Pages: ${pages.length} items`)
  pages.forEach(page => {
    console.log(`   - ${page.title} (/${page.slug}) [${page.status}]`)
  })
  
  // Check Navigation
  const headerNav = await prisma.navigation.findMany({
    where: { type: 'header' },
    orderBy: { order: 'asc' }
  })
  console.log(`\n🧭 Header Navigation: ${headerNav.length} items`)
  headerNav.forEach(nav => {
    console.log(`   ${nav.order}. ${nav.label} → ${nav.url}`)
  })
  
  const footerNav = await prisma.navigation.findMany({
    where: { type: 'footer' },
    orderBy: { order: 'asc' }
  })
  console.log(`\n🧭 Footer Navigation: ${footerNav.length} items`)
  footerNav.forEach(nav => {
    console.log(`   ${nav.order}. ${nav.label} → ${nav.url}`)
  })
  
  // Sample some settings
  console.log('\n📋 Sample Settings:')
  const sampleKeys = ['site.title', 'site.tagline', 'contact.email', 'contact.phone', 'contact.whatsapp']
  for (const key of sampleKeys) {
    const setting = await prisma.settings.findUnique({ where: { key } })
    if (setting) {
      console.log(`   ${key}: ${setting.value}`)
    }
  }
  
  console.log('\n✅ CMS seed verification complete!')
}

main()
  .catch((e) => {
    console.error('❌ Verification failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
