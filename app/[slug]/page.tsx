import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { ScrollToTop } from '@/components/scroll-to-top'
import { DynamicPageContent } from '@/components/dynamic-page-content'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    // Fetch page data and default settings in parallel
    const [pageResponse, settingsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/content/pages/${slug}`, {
        next: { revalidate: 300 }
      }),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/content/settings`, {
        next: { revalidate: 600 }
      })
    ])
    
    // Get default settings for fallbacks
    let defaultSettings = {
      siteTitle: 'BS3DCrafts',
      metaDescription: 'BS3DCrafts - Premium 3D Printing Services',
      keywords: ''
    }
    
    if (settingsResponse.ok) {
      const settings = await settingsResponse.json()
      if (settings.general) {
        defaultSettings = {
          siteTitle: settings.general['site.title'] || defaultSettings.siteTitle,
          metaDescription: settings.general['site.metaDescription'] || defaultSettings.metaDescription,
          keywords: settings.general['site.keywords'] || defaultSettings.keywords
        }
      }
    }
    
    if (!pageResponse.ok) {
      return { 
        title: 'Sayfa bulunamadı',
        description: defaultSettings.metaDescription
      }
    }
    
    const page = await pageResponse.json()
    
    // Use page metadata with fallbacks to default settings
    const title = page.metaTitle || page.title || defaultSettings.siteTitle
    const description = page.metaDescription || defaultSettings.metaDescription
    const keywords = page.keywords || defaultSettings.keywords
    
    return {
      title,
      description,
      keywords: keywords ? keywords.split(',').map((k: string) => k.trim()) : undefined,
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: defaultSettings.siteTitle
      },
      twitter: {
        card: 'summary',
        title,
        description
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return { 
      title: 'BS3DCrafts',
      description: 'BS3DCrafts - Premium 3D Printing Services'
    }
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  
  // Fetch page content from API
  let pageData = null
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/content/pages/${slug}`, {
      next: { revalidate: 300 }
    })
    
    if (response.ok) {
      pageData = await response.json()
    } else if (response.status === 404) {
      notFound()
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    notFound()
  }

  if (!pageData) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar />
      
      <main className="flex-1 relative z-10">
        <DynamicPageContent data={pageData} />
      </main>

      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
    </div>
  )
}