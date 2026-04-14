/**
 * Email Service
 * 
 * High-level email sending functions for different scenarios
 */

import { sendEmail, EMAIL_CONFIG } from './email-client'
import { render } from '@react-email/components'
import OrderConfirmationEmail from '@/emails/order-confirmation'
import AdminOrderNotification from '@/emails/admin-order-notification'
import OrderStatusUpdateEmail from '@/emails/order-status-update'

interface OrderData {
  orderNumber: string
  orderDate: Date
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

interface OrderStatusEmailData {
  customerEmail: string
  customerName: string
  orderId: string
  status: string
  trackingNumber?: string
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(orderData: OrderData) {
  try {
    const emailHtml = await render(
      OrderConfirmationEmail({
        customerName: orderData.customerName,
        orderNumber: orderData.orderNumber,
        orderDate: orderData.orderDate.toLocaleDateString('tr-TR'),
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
      })
    )

    const result = await sendEmail({
      to: orderData.customerEmail,
      subject: `Siparişiniz Alındı - ${orderData.orderNumber}`,
      html: emailHtml,
    })

    if (result.success) {
      console.log('Order confirmation email sent to:', orderData.customerEmail)
    } else {
      console.error('Failed to send order confirmation email:', result.error)
    }

    return result
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    return { success: false, error }
  }
}

/**
 * Send order notification to admin
 */
export async function sendAdminOrderNotification(orderData: OrderData) {
  try {
    const emailHtml = await render(
      AdminOrderNotification({
        orderNumber: orderData.orderNumber,
        orderDate: orderData.orderDate.toLocaleDateString('tr-TR'),
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        items: orderData.items,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        shippingAddress: orderData.shippingAddress,
      })
    )

    const result = await sendEmail({
      to: EMAIL_CONFIG.adminEmail,
      subject: `🛍️ Yeni Sipariş - ${orderData.orderNumber}`,
      html: emailHtml,
    })

    if (result.success) {
      console.log('Admin notification email sent')
    } else {
      console.error('Failed to send admin notification email:', result.error)
    }

    return result
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    return { success: false, error }
  }
}

/**
 * Send order status update email to customer
 */
export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
  try {
    // Get status display text in Turkish
    const statusText = {
      pending: 'Beklemede',
      paid: 'Ödendi',
      shipped: 'Kargoya Verildi',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi'
    }[data.status] || data.status

    const emailHtml = await render(
      OrderStatusUpdateEmail({
        customerName: data.customerName,
        orderId: data.orderId,
        status: data.status,
        statusText: statusText,
        trackingNumber: data.trackingNumber,
        items: data.orderItems,
        totalAmount: data.totalAmount,
      })
    )

    const subject = data.status === 'shipped' 
      ? `📦 Siparişiniz Kargoya Verildi - ${data.orderId}`
      : `📋 Sipariş Durumu Güncellendi - ${data.orderId}`

    const result = await sendEmail({
      to: data.customerEmail,
      subject,
      html: emailHtml,
    })

    if (result.success) {
      console.log('Order status email sent to:', data.customerEmail)
    } else {
      console.error('Failed to send order status email:', result.error)
    }

    return result
  } catch (error) {
    console.error('Error sending order status email:', error)
    return { success: false, error }
  }
}

/**
 * Send both customer and admin emails for a new order
 */
export async function sendOrderEmails(orderData: OrderData) {
  const results = await Promise.allSettled([
    sendOrderConfirmation(orderData),
    sendAdminOrderNotification(orderData),
  ])

  return {
    customerEmail: results[0].status === 'fulfilled' ? results[0].value : { success: false },
    adminEmail: results[1].status === 'fulfilled' ? results[1].value : { success: false },
  }
}
