import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { sanitizeHTML } from '@/lib/sanitize'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await prisma.page.findFirst({
    where: { slug, status: 'published' },
  })
  if (!page) return { title: 'Sayfa bulunamadı' }
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    keywords: page.keywords ? page.keywords.split(',').map((k) => k.trim()) : undefined,
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const page = await prisma.page.findFirst({
    where: { slug, status: 'published' },
  })
  if (!page) notFound()

  const html = sanitizeHTML(page.content)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl text-gray-200 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_p]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary">
        <article dangerouslySetInnerHTML={{ __html: html }} />
      </main>
      <Footer />
    </div>
  )
}
