import { revalidatePath } from 'next/cache'

export function revalidatePublicCatalog(slug?: string) {
  revalidatePath('/products')
  if (slug) revalidatePath(`/products/${slug}`)
}
