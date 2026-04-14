'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSiteSettings as useContentSiteSettings } from '@/hooks/use-content'

// Raw API response structure (grouped by category)
interface RawSettingsResponse {
  general?: Record<string, string>
  contact?: Record<string, string>
  social?: Record<string, string>
  features?: Record<string, string>
  analytics?: Record<string, string>
}

// Processed settings structure for components
interface SiteSettings {
  general?: {
    siteTitle?: string
    tagline?: string
    metaDescription?: string
    logo?: string
  }
  contact?: {
    email?: string
    phone?: string
    whatsappNumber?: string
    address?: string
  }
  social?: {
    instagram?: string
    twitter?: string
    facebook?: string
    linkedin?: string
  }
  features?: {
    newsletter?: boolean
    whatsappButton?: boolean
    testimonials?: boolean
  }
  analytics?: {
    googleId?: string
    facebookPixel?: string
  }
}

interface SiteSettingsContextType {
  settings: SiteSettings | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  loading: true,
  error: null,
  refresh: () => {}
})

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

// Transform raw API response to component-friendly structure
function transformSettings(rawSettings: any): SiteSettings {
  // Handle both old grouped format and new flat format
  if (rawSettings.general || rawSettings.contact) {
    // Old grouped format
    return {
      general: {
        siteTitle: rawSettings.general?.['site.title'],
        tagline: rawSettings.general?.['site.tagline'],
        metaDescription: rawSettings.general?.['site.description'],
        logo: rawSettings.general?.['site.logo']
      },
      contact: {
        email: rawSettings.contact?.['contact.email'],
        phone: rawSettings.contact?.['contact.phone'],
        whatsappNumber: rawSettings.contact?.['contact.whatsapp'],
        address: rawSettings.contact?.['contact.address']
      },
      social: {
        instagram: rawSettings.social?.['social.instagram'],
        twitter: rawSettings.social?.['social.twitter'],
        facebook: rawSettings.social?.['social.facebook'],
        linkedin: rawSettings.social?.['social.linkedin']
      },
      features: {
        newsletter: rawSettings.features?.['features.newsletter'] === 'true',
        whatsappButton: rawSettings.features?.['features.whatsapp_button'] === 'true',
        testimonials: rawSettings.features?.['features.testimonials'] === 'true'
      },
      analytics: {
        googleId: rawSettings.analytics?.['analytics.google_id'],
        facebookPixel: rawSettings.analytics?.['analytics.facebook_pixel']
      }
    }
  } else {
    // New flat format from API
    return {
      general: {
        siteTitle: rawSettings.siteTitle,
        tagline: rawSettings.tagline,
        metaDescription: rawSettings.metaDescription,
        logo: rawSettings.logo
      },
      contact: {
        email: rawSettings.contactEmail,
        phone: rawSettings.contactPhone,
        whatsappNumber: rawSettings.whatsappNumber,
        address: rawSettings.contactAddress
      },
      social: {
        instagram: rawSettings.socialMedia?.instagram,
        twitter: rawSettings.socialMedia?.twitter,
        facebook: rawSettings.socialMedia?.facebook,
        linkedin: rawSettings.socialMedia?.linkedin
      },
      features: {
        newsletter: rawSettings.features?.newsletter === true,
        whatsappButton: rawSettings.features?.whatsappButton === true,
        testimonials: rawSettings.features?.testimonials === true
      },
      analytics: {
        googleId: rawSettings.analytics?.googleId,
        facebookPixel: rawSettings.analytics?.facebookPixel
      }
    }
  }
}

interface SiteSettingsProviderProps {
  children: ReactNode
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const { data: rawSettings, isLoading, isError, error, refresh } = useContentSiteSettings()

  // Transform the raw settings to component-friendly structure
  const settings = rawSettings ? transformSettings(rawSettings) : null

  const contextValue: SiteSettingsContextType = {
    settings,
    loading: isLoading,
    error: isError ? 'Failed to load settings' : null,
    refresh
  }

  return (
    <SiteSettingsContext.Provider value={contextValue}>
      {children}
    </SiteSettingsContext.Provider>
  )
}