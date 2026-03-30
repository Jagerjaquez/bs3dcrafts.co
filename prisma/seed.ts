import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Seeding database...')

  // Önce mevcut ürünleri kontrol et
  const existingProducts = await prisma.product.count()
  
  if (existingProducts > 0) {
    console.log(`✅ Database already has ${existingProducts} products. Skipping seed.`)
    return
  }

  // Örnek ürünler
  const products = [
    {
      name: 'Geometrik Vazo',
      slug: 'geometrik-vazo',
      description: 'Modern tasarım geometrik vazo. PLA filament ile üretilmiş, dayanıklı ve estetik. Çiçekleriniz için mükemmel bir ev. Su geçirmez iç kaplama ile güvenle kullanabilirsiniz.',
      price: 299.99,
      stock: 15,
      category: 'Dekorasyon',
      material: 'PLA',
      printTimeEstimate: '8-10 saat',
      weight: 250,
      featured: true
    },
    {
      name: 'Telefon Standı',
      slug: 'telefon-standi',
      description: 'Ergonomik tasarım telefon standı. Masaüstü kullanım için ideal. Tüm telefon modellerine uyumlu, kaymaz taban ile güvenli tutuş.',
      price: 149.99,
      stock: 25,
      category: 'Aksesuar',
      material: 'PETG',
      printTimeEstimate: '4-5 saat',
      weight: 120,
      featured: true
    },
    {
      name: 'Kulaklık Askısı',
      slug: 'kulaklik-askisi',
      description: 'Duvara monte edilebilir kulaklık askısı. Güçlü yapışkan dahil. Kulaklıklarınızı düzenli ve güvenli bir şekilde saklayın.',
      price: 99.99,
      discountedPrice: 79.99,
      stock: 30,
      category: 'Aksesuar',
      material: 'ABS',
      printTimeEstimate: '3-4 saat',
      weight: 80,
      featured: false
    },
    {
      name: 'Saksı - Küçük Boy',
      slug: 'saksi-kucuk',
      description: 'Sukulent bitkiler için ideal küçük boy saksı. Su geçirmez kaplama ile bitkileriniz güvende. Modern ve minimalist tasarım.',
      price: 129.99,
      stock: 20,
      category: 'Dekorasyon',
      material: 'PLA',
      printTimeEstimate: '5-6 saat',
      weight: 150,
      featured: false
    },
    {
      name: 'Kablo Düzenleyici Set',
      slug: 'kablo-duzenleyici-set',
      description: '5 parçalı kablo düzenleyici set. Masaüstü organizasyonu için mükemmel. Karmaşık kabloları düzenli tutun, çalışma alanınızı temiz tutun.',
      price: 179.99,
      stock: 18,
      category: 'Aksesuar',
      material: 'PETG',
      printTimeEstimate: '6-7 saat',
      weight: 200,
      featured: true
    },
    {
      name: 'Duvar Saati - Modern',
      slug: 'duvar-saati-modern',
      description: 'Minimalist tasarım duvar saati. Sessiz mekanizma ile rahatsız etmez. Her mekana uyum sağlayan şık tasarım.',
      price: 349.99,
      stock: 12,
      category: 'Dekorasyon',
      material: 'PLA',
      printTimeEstimate: '10-12 saat',
      weight: 300,
      featured: true
    },
    {
      name: 'Anahtarlık - Özel Tasarım',
      slug: 'anahtarlik-ozel',
      description: 'Kişiselleştirilebilir anahtarlık. İsim veya logo eklenebilir. Dayanıklı ve hafif yapısı ile günlük kullanıma uygun.',
      price: 49.99,
      stock: 50,
      category: 'Aksesuar',
      material: 'PETG',
      printTimeEstimate: '1-2 saat',
      weight: 30,
      featured: false
    },
    {
      name: 'Kalemlik - Geometrik',
      slug: 'kalemlik-geometrik',
      description: 'Modern geometrik desenli kalemlik. Masaüstü organizasyonu için ideal. Kalem, makas ve diğer ofis malzemeleriniz için geniş alan.',
      price: 159.99,
      stock: 22,
      category: 'Ev & Yaşam',
      material: 'PLA',
      printTimeEstimate: '6-7 saat',
      weight: 180,
      featured: false
    },
    {
      name: 'Oyuncak Araba - Klasik',
      slug: 'oyuncak-araba-klasik',
      description: 'Klasik tasarım oyuncak araba. Çocuklar için güvenli, keskin kenar yok. Hareketli tekerlekler ile gerçekçi oyun deneyimi.',
      price: 199.99,
      stock: 15,
      category: 'Oyuncak',
      material: 'PLA',
      printTimeEstimate: '8-9 saat',
      weight: 150,
      featured: true
    },
    {
      name: 'Bardak Altlığı Set (4\'lü)',
      slug: 'bardak-altligi-set',
      description: '4 parçalı bardak altlığı seti. Masalarınızı korur, şık görünüm sağlar. Kaymaz taban ile güvenli kullanım.',
      price: 129.99,
      stock: 28,
      category: 'Ev & Yaşam',
      material: 'PETG',
      printTimeEstimate: '5-6 saat',
      weight: 120,
      featured: false
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
    console.log(`✅ Created product: ${product.name}`)
  }

  console.log('✨ Seeding completed! Created 10 products.')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
