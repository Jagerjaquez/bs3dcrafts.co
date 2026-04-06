import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductDetails } from '@/components/product-details'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { getPublishedProductBySlug } from '@/lib/public-products'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await getPublishedProductBySlug(slug)

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
