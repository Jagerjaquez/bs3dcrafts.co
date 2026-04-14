import { MetadataRoute } from 'next'
import { getPublishedPageSlugs } from '@/lib/cms-public'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bs3dcrafts.vercel.app'
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Get published dynamic pages
  let dynamicPages: MetadataRoute.Sitemap = []
  try {
    const publishedPages = await getPublishedPageSlugs()
    dynamicPages = publishedPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('Error fetching published pages for sitemap:', error)
  }

  // Get published products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const publishedProducts = await prisma.product.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    })
    
    productPages = publishedProducts.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching published products for sitemap:', error)
  }

  return [...staticPages, ...dynamicPages, ...productPages]
}
