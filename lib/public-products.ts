import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const catalogInclude = {
  media: { orderBy: { order: 'asc' as const } },
} satisfies Prisma.ProductInclude

export function publishedWhere(
  extra?: Prisma.ProductWhereInput
): Prisma.ProductWhereInput {
  return { status: 'published', ...extra }
}

export async function listPublishedCatalog() {
  return prisma.product.findMany({
    where: publishedWhere(),
    include: catalogInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPublishedProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: publishedWhere({ slug }),
    include: catalogInclude,
  })
}
