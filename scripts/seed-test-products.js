// Test ürünleri oluşturma scripti
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTestProducts() {
  try {
    console.log('🌱 Test ürünleri oluşturuluyor...')

    // Test ürünlerini oluştur
    const testProducts = [
      {
        id: 'test-product-1',
        name: 'Test Ürün 1',
        slug: 'test-urun-1',
        description: 'PayTR entegrasyonu için test ürünü 1',
        price: 100,
        stock: 10,
        category: 'test',
        material: 'PLA',
        printTimeEstimate: '2 saat',
        weight: 0.1,
        featured: false,
        status: 'published'
      },
      {
        id: 'test-product-2',
        name: 'Test Ürün 2',
        slug: 'test-urun-2',
        description: 'PayTR entegrasyonu için test ürünü 2',
        price: 50,
        stock: 5,
        category: 'test',
        material: 'PETG',
        printTimeEstimate: '1 saat',
        weight: 0.05,
        featured: false,
        status: 'published'
      }
    ]

    for (const product of testProducts) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: product.id }
      })

      if (existingProduct) {
        console.log(`✅ Test ürün zaten mevcut: ${product.name}`)
        continue
      }

      await prisma.product.create({
        data: product
      })

      console.log(`✅ Test ürün oluşturuldu: ${product.name}`)
    }

    console.log('🎉 Test ürünleri başarıyla oluşturuldu!')

  } catch (error) {
    console.error('❌ Test ürünleri oluşturulurken hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestProducts()