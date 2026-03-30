/**
 * Email Client using Resend
 * 
 * Handles all transactional email sending for the platform
 */

import { Resend } from 'resend'

// Initialize Resend client
let resendClient: Resend | null = null

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured')
    }
    
    resendClient = new Resend(apiKey)
  }
  
  return resendClient
}

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'BS3DCrafts <orders@bs3dcrafts.com>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@bs3dcrafts.com',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bs3dcrafts.com',
}

/**
 * Send email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}) {
  try {
    const resend = getResendClient()
    
    const result = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: replyTo || EMAIL_CONFIG.replyTo,
    })
    
    console.log('Email sent successfully:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
