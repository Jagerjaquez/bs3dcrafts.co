import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bs3dcrafts.vercel.app'

  // Default robots configuration
  let robotsConfig = {
    allowCrawling: true,
    disallowPaths: ['/admin/', '/api/', '/test/'],
    additionalDisallowPaths: [] as string[]
  }

  try {
    // Fetch SEO settings from database
    const seoSettings = await prisma.settings.findMany({
      where: {
        category: 'seo',
        key: {
          in: ['robots.allow_crawling', 'robots.disallow_paths']
        }
      }
    })

    // Apply settings if they exist
    for (const setting of seoSettings) {
      if (setting.key === 'robots.allow_crawling') {
        robotsConfig.allowCrawling = setting.value === 'true'
      } else if (setting.key === 'robots.disallow_paths') {
        try {
          const paths = JSON.parse(setting.value)
          if (Array.isArray(paths)) {
            robotsConfig.additionalDisallowPaths = paths
          }
        } catch {
          // Invalid JSON, ignore
        }
      }
    }
  } catch (error) {
    console.error('Error fetching robots settings:', error)
    // Use defaults if database is not available
  }

  // Combine default and additional disallow paths
  const allDisallowPaths = [
    ...robotsConfig.disallowPaths,
    ...robotsConfig.additionalDisallowPaths
  ]

  if (!robotsConfig.allowCrawling) {
    // Disallow all crawling
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: allDisallowPaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
