import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductDetails } from '@/components/product-details'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { prisma } from '@/lib/prisma'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  // Database'den ürünü çek
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      media: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <ProductDetails product={product} />
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  )
}
