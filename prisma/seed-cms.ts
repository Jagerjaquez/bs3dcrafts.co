import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({})

async function main() {
  console.log('🌱 Seeding CMS data...')

  // Check if CMS data already exists
  const existingSettings = await prisma.settings.count()
  const existingPages = await prisma.page.count()
  const existingNavigation = await prisma.navigation.count()

  if (existingSettings > 0 || existingPages > 0 || existingNavigation > 0) {
    console.log(`⚠️  CMS data already exists:`)
    console.log(`   - Settings: ${existingSettings}`)
    console.log(`   - Pages: ${existingPages}`)
    console.log(`   - Navigation: ${existingNavigation}`)
    console.log(`   Skipping CMS seed to avoid duplicates.`)
    return
  }

  // 1. Seed Site Settings
  console.log('📝 Seeding site settings...')
  
  const settings = [
    // General settings
    { key: 'site.title', value: 'BS3DCrafts', category: 'general' },
    { key: 'site.tagline', value: 'Precision in Every Layer', category: 'general' },
    { key: 'site.description', value: 'Professional 3D printing services and custom designs in İzmir, Turkey. High-quality PLA, PETG, and ABS prints for your creative projects.', category: 'general' },
    { key: 'site.keywords', value: '3d printing, 3d baskı, izmir, custom design, özel tasarım, pla, petg, abs', category: 'general' },
    
    // Contact information
    { key: 'contact.email', value: 'bs3dcrafts.co@outlook.com', category: 'contact' },
    { key: 'contact.phone', value: '+90 546 451 95 97', category: 'contact' },
    { key: 'contact.whatsapp', value: '905464519597', category: 'contact' },
    { key: 'contact.address', value: 'Karşıyaka, İzmir, Türkiye', category: 'contact' },
    
    // Social media
    { key: 'social.instagram', value: 'https://instagram.com/bs3dcrafts', category: 'social' },
    { key: 'social.twitter', value: '', category: 'social' },
    { key: 'social.facebook', value: '', category: 'social' },
    { key: 'social.linkedin', value: '', category: 'social' },
    
    // Features
    { key: 'features.newsletter', value: 'true', category: 'features' },
    { key: 'features.whatsapp_button', value: 'true', category: 'features' },
    { key: 'features.testimonials', value: 'true', category: 'features' },
    
    // Analytics (empty by default)
    { key: 'analytics.google_id', value: '', category: 'analytics' },
    { key: 'analytics.facebook_pixel', value: '', category: 'analytics' },
    
    // SEO settings
    { key: 'robots.allow_crawling', value: 'true', category: 'seo' },
    { key: 'robots.disallow_paths', value: '[]', category: 'seo' },
  ]

  for (const setting of settings) {
    await prisma.settings.create({ data: setting })
  }
  console.log(`✅ Created ${settings.length} site settings`)

  // 2. Seed Default Pages
  console.log('📄 Seeding default pages...')
  
  const pages = [
    {
      title: 'Hakkımızda',
      slug: 'about',
      content: `<h1>BS3DCrafts Hakkında</h1>
<p>BS3DCrafts, İzmir merkezli profesyonel 3D baskı hizmetleri sunan bir atölyedir. 2024 yılında kurulan firmamız, yüksek kaliteli 3D baskı teknolojisi ile müşterilerimize özel tasarım ve üretim hizmetleri sunmaktadır.</p>

<h2>Misyonumuz</h2>
<p>3D baskı teknolojisini herkes için erişilebilir kılmak ve yaratıcı projelerinizi hayata geçirmenize yardımcı olmak. Her katmanda hassasiyet ve kalite odaklı çalışıyoruz.</p>

<h2>Neden BS3DCrafts?</h2>
<ul>
<li><strong>Yüksek Kalite:</strong> PLA, PETG ve ABS gibi premium malzemelerle üretim</li>
<li><strong>Hızlı Teslimat:</strong> Siparişleriniz en kısa sürede hazırlanır</li>
<li><strong>Özel Tasarım:</strong> Kendi tasarımlarınızı hayata geçirebilirsiniz</li>
<li><strong>Uygun Fiyat:</strong> Rekabetçi fiyatlarla kaliteli hizmet</li>
<li><strong>Müşteri Memnuniyeti:</strong> 7/24 destek ve danışmanlık</li>
</ul>

<h2>İletişim</h2>
<p>Sorularınız için bize ulaşabilirsiniz:</p>
<ul>
<li>E-posta: bs3dcrafts.co@outlook.com</li>
<li>Telefon: +90 546 451 95 97</li>
<li>WhatsApp: +90 546 451 95 97</li>
<li>Adres: Karşıyaka, İzmir, Türkiye</li>
</ul>`,
      metaTitle: 'Hakkımızda - BS3DCrafts',
      metaDescription: 'BS3DCrafts, İzmir merkezli profesyonel 3D baskı hizmetleri sunan bir atölyedir. Yüksek kaliteli PLA, PETG ve ABS baskılar.',
      keywords: '3d printing izmir, 3d baskı hizmeti, özel tasarım, hakkımızda',
      status: 'published'
    },
    {
      title: 'Sıkça Sorulan Sorular',
      slug: 'faq',
      content: `<h1>Sıkça Sorulan Sorular</h1>

<h2>3D baskı nedir?</h2>
<p>3D baskı, dijital bir tasarımdan katman katman malzeme ekleyerek üç boyutlu nesneler oluşturma teknolojisidir. PLA, PETG, ABS gibi plastik filamentler kullanılarak çeşitli ürünler üretilebilir.</p>

<h2>Hangi malzemeleri kullanıyorsunuz?</h2>
<p>Başlıca kullandığımız malzemeler:</p>
<ul>
<li><strong>PLA:</strong> Çevre dostu, kolay işlenebilir, dekoratif ürünler için ideal</li>
<li><strong>PETG:</strong> Dayanıklı, esnek, fonksiyonel parçalar için uygun</li>
<li><strong>ABS:</strong> Yüksek sıcaklığa dayanıklı, mekanik parçalar için tercih edilir</li>
</ul>

<h2>Sipariş süreci nasıl işler?</h2>
<ol>
<li>Ürünü sepete ekleyin veya özel tasarım için iletişime geçin</li>
<li>Ödeme işlemini tamamlayın</li>
<li>Ürününüz üretilir (tahmini süre ürün sayfasında belirtilir)</li>
<li>Kargo ile adresinize gönderilir</li>
</ol>

<h2>Teslimat ne kadar sürer?</h2>
<p>Üretim süresi ürüne göre değişir (genellikle 1-12 saat). Üretim tamamlandıktan sonra kargo ile 2-5 iş günü içinde adresinize ulaşır.</p>

<h2>Özel tasarım yaptırabilir miyim?</h2>
<p>Evet! Kendi tasarımlarınızı STL dosyası olarak gönderebilir veya fikrinizi paylaşarak bizden tasarım hizmeti alabilirsiniz. İletişim için WhatsApp veya e-posta kullanabilirsiniz.</p>

<h2>İade ve değişim politikanız nedir?</h2>
<p>Üretim hatası veya hasarlı ürün durumunda 14 gün içinde iade veya değişim yapılabilir. Özel tasarım ürünlerde iade kabul edilmemektedir.</p>

<h2>Toplu sipariş verebilir miyim?</h2>
<p>Evet, toplu siparişler için özel fiyat teklifi sunuyoruz. Lütfen bizimle iletişime geçin.</p>

<h2>Ödeme yöntemleri nelerdir?</h2>
<p>Kredi kartı, banka kartı ve havale ile ödeme kabul edilmektedir. Güvenli ödeme için Stripe altyapısını kullanıyoruz.</p>`,
      metaTitle: 'Sıkça Sorulan Sorular - BS3DCrafts',
      metaDescription: '3D baskı hizmetlerimiz hakkında sıkça sorulan sorular ve cevapları. Malzemeler, teslimat, özel tasarım ve daha fazlası.',
      keywords: 'sss, faq, 3d baskı soruları, teslimat, özel tasarım',
      status: 'published'
    },
    {
      title: 'Kullanım Koşulları',
      slug: 'terms',
      content: `<h1>Kullanım Koşulları</h1>
<p><em>Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}</em></p>

<h2>1. Genel Hükümler</h2>
<p>Bu web sitesini (bs3dcrafts.com) kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız. Koşulları kabul etmiyorsanız lütfen siteyi kullanmayınız.</p>

<h2>2. Hizmet Kapsamı</h2>
<p>BS3DCrafts, 3D baskı hizmetleri ve ürün satışı yapmaktadır. Ürün açıklamaları, fiyatlar ve teslimat süreleri değişiklik gösterebilir.</p>

<h2>3. Sipariş ve Ödeme</h2>
<ul>
<li>Tüm siparişler onay sonrası kesinleşir</li>
<li>Ödeme işlemleri güvenli Stripe altyapısı üzerinden yapılır</li>
<li>Fiyatlar TL olarak belirtilmiştir ve KDV dahildir</li>
<li>Stok durumuna göre sipariş iptal edilebilir</li>
</ul>

<h2>4. Teslimat</h2>
<ul>
<li>Teslimat süreleri tahminidir ve garanti edilmez</li>
<li>Kargo ücreti sepet toplamına eklenir</li>
<li>Teslimat adresi değişikliği kargo çıkışından önce yapılmalıdır</li>
</ul>

<h2>5. İade ve İptal</h2>
<ul>
<li>Üretim hatası veya hasarlı ürünlerde 14 gün içinde iade hakkı vardır</li>
<li>Özel tasarım ürünlerde iade kabul edilmez</li>
<li>İade kargo ücreti müşteriye aittir (hatalı ürün hariç)</li>
</ul>

<h2>6. Fikri Mülkiyet</h2>
<p>Site içeriği, tasarımlar ve görseller BS3DCrafts'a aittir. İzinsiz kullanım yasaktır. Müşteri tarafından sağlanan tasarımların telif hakkı müşteriye aittir.</p>

<h2>7. Sorumluluk Sınırlaması</h2>
<p>BS3DCrafts, ürünlerin kullanımından kaynaklanan dolaylı zararlardan sorumlu değildir. Ürünler yalnızca belirtilen amaçlar için kullanılmalıdır.</p>

<h2>8. Gizlilik</h2>
<p>Kişisel verileriniz Gizlilik Politikamız kapsamında işlenir ve korunur.</p>

<h2>9. Değişiklikler</h2>
<p>BS3DCrafts bu koşulları önceden haber vermeksizin değiştirme hakkını saklı tutar.</p>

<h2>10. İletişim</h2>
<p>Sorularınız için: bs3dcrafts.co@outlook.com</p>`,
      metaTitle: 'Kullanım Koşulları - BS3DCrafts',
      metaDescription: 'BS3DCrafts web sitesi kullanım koşulları, sipariş, teslimat, iade ve gizlilik politikaları.',
      keywords: 'kullanım koşulları, şartlar, terms of service',
      status: 'published'
    },
    {
      title: 'Gizlilik Politikası',
      slug: 'privacy',
      content: `<h1>Gizlilik Politikası</h1>
<p><em>Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}</em></p>

<h2>1. Giriş</h2>
<p>BS3DCrafts olarak gizliliğinize önem veriyoruz. Bu politika, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>

<h2>2. Toplanan Bilgiler</h2>
<p>Aşağıdaki bilgileri toplayabiliriz:</p>
<ul>
<li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta, telefon</li>
<li><strong>Adres Bilgileri:</strong> Teslimat ve fatura adresi</li>
<li><strong>Ödeme Bilgileri:</strong> Kredi kartı bilgileri (Stripe üzerinden güvenli işlenir)</li>
<li><strong>Sipariş Bilgileri:</strong> Satın alınan ürünler, sipariş geçmişi</li>
<li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, çerezler</li>
</ul>

<h2>3. Bilgilerin Kullanımı</h2>
<p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
<ul>
<li>Siparişleri işlemek ve teslimat yapmak</li>
<li>Müşteri desteği sağlamak</li>
<li>Ödeme işlemlerini gerçekleştirmek</li>
<li>Site deneyimini iyileştirmek</li>
<li>Yasal yükümlülükleri yerine getirmek</li>
<li>Pazarlama iletişimi (onay vermeniz halinde)</li>
</ul>

<h2>4. Bilgi Paylaşımı</h2>
<p>Kişisel bilgilerinizi üçüncü taraflarla paylaşmayız, ancak şu durumlar istisnadır:</p>
<ul>
<li><strong>Ödeme İşlemcisi:</strong> Stripe (güvenli ödeme için)</li>
<li><strong>Kargo Firması:</strong> Teslimat için gerekli bilgiler</li>
<li><strong>Yasal Zorunluluk:</strong> Mahkeme kararı veya yasal talep</li>
</ul>

<h2>5. Çerezler (Cookies)</h2>
<p>Sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Çerezleri tarayıcı ayarlarından yönetebilirsiniz.</p>

<h2>6. Veri Güvenliği</h2>
<p>Verilerinizi korumak için:</p>
<ul>
<li>SSL şifreleme kullanıyoruz</li>
<li>Güvenli sunucularda saklıyoruz</li>
<li>Erişimi sınırlıyoruz</li>
<li>Düzenli güvenlik güncellemeleri yapıyoruz</li>
</ul>

<h2>7. Haklarınız</h2>
<p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
<ul>
<li>Verilerinize erişim talep etme</li>
<li>Verilerin düzeltilmesini isteme</li>
<li>Verilerin silinmesini talep etme</li>
<li>Pazarlama iletişiminden çıkma</li>
</ul>

<h2>8. Çocukların Gizliliği</h2>
<p>Sitemiz 18 yaş altı kullanıcılara yönelik değildir. Bilerek çocuklardan veri toplamıyoruz.</p>

<h2>9. Değişiklikler</h2>
<p>Bu politikayı zaman zaman güncelleyebiliriz. Değişiklikler bu sayfada yayınlanacaktır.</p>

<h2>10. İletişim</h2>
<p>Gizlilik ile ilgili sorularınız için:</p>
<ul>
<li>E-posta: bs3dcrafts.co@outlook.com</li>
<li>Telefon: +90 546 451 95 97</li>
<li>Adres: Karşıyaka, İzmir, Türkiye</li>
</ul>`,
      metaTitle: 'Gizlilik Politikası - BS3DCrafts',
      metaDescription: 'BS3DCrafts gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.',
      keywords: 'gizlilik politikası, kvkk, kişisel veriler, privacy policy',
      status: 'published'
    }
  ]

  for (const page of pages) {
    await prisma.page.create({ data: page })
  }
  console.log(`✅ Created ${pages.length} default pages`)

  // 3. Seed Navigation Structure
  console.log('🧭 Seeding navigation structure...')
  
  // Header Navigation
  const headerNav = [
    { type: 'header', label: 'Ana Sayfa', url: '/', order: 1 },
    { type: 'header', label: 'Ürünler', url: '/products', order: 2 },
    { type: 'header', label: 'Hakkımızda', url: '/about', order: 3 },
    { type: 'header', label: 'SSS', url: '/faq', order: 4 },
    { type: 'header', label: 'İletişim', url: '/contact', order: 5 },
  ]

  for (const nav of headerNav) {
    await prisma.navigation.create({ data: nav })
  }
  console.log(`✅ Created ${headerNav.length} header navigation items`)

  // Footer Navigation
  const footerNav = [
    { type: 'footer', label: 'Hakkımızda', url: '/about', order: 1 },
    { type: 'footer', label: 'Sıkça Sorulan Sorular', url: '/faq', order: 2 },
    { type: 'footer', label: 'Kullanım Koşulları', url: '/terms', order: 3 },
    { type: 'footer', label: 'Gizlilik Politikası', url: '/privacy', order: 4 },
    { type: 'footer', label: 'İletişim', url: '/contact', order: 5 },
  ]

  for (const nav of footerNav) {
    await prisma.navigation.create({ data: nav })
  }
  console.log(`✅ Created ${footerNav.length} footer navigation items`)

  console.log('✨ CMS seeding completed successfully!')
  console.log(`
📊 Summary:
   - Settings: ${settings.length} items
   - Pages: ${pages.length} pages
   - Navigation: ${headerNav.length + footerNav.length} items (${headerNav.length} header + ${footerNav.length} footer)
  `)
}

main()
  .catch((e) => {
    console.error('❌ CMS seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
