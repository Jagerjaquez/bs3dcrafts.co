// Google Analytics helper functions
// GA_MEASUREMENT_ID environment variable'ı ekleyerek aktif hale getirin

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track events
export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Track e-commerce events
export const trackPurchase = (orderId: string, value: number, items: any[]) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: value,
      currency: 'TRY',
      items: items,
    })
  }
}

export const trackAddToCart = (item: any) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'add_to_cart', {
      currency: 'TRY',
      value: item.price,
      items: [item],
    })
  }
}

export const trackBeginCheckout = (items: any[], value: number) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'begin_checkout', {
      currency: 'TRY',
      value: value,
      items: items,
    })
  }
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}
