/**
 * Admin Order Notification Email Template
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface AdminOrderNotificationProps {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
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

export const AdminOrderNotification = ({
  orderNumber = '#12345',
  orderDate = new Date().toLocaleDateString('tr-TR'),
  customerName = 'Test Müşteri',
  customerEmail = 'test@example.com',
  customerPhone = '+90 555 123 4567',
  items = [],
  total = 0,
  paymentMethod = 'Stripe',
  shippingAddress,
}: AdminOrderNotificationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Yeni Sipariş - {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🛍️ Yeni Sipariş Alındı</Heading>
          
          <Section style={alertBox}>
            <Text style={alertText}>
              <strong>Sipariş No:</strong> {orderNumber}
            </Text>
            <Text style={alertText}>
              <strong>Tarih:</strong> {orderDate}
            </Text>
            <Text style={alertText}>
              <strong>Ödeme:</strong> {paymentMethod}
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Heading as="h2" style={h2}>
            Müşteri Bilgileri
          </Heading>
          
          <Text style={text}>
            <strong>Ad Soyad:</strong> {customerName}
          </Text>
          <Text style={text}>
            <strong>Email:</strong> <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link>
          </Text>
          <Text style={text}>
            <strong>Telefon:</strong> <Link href={`tel:${customerPhone}`}>{customerPhone}</Link>
          </Text>
          
          <Hr style={hr} />
          
          <Heading as="h2" style={h2}>
            Sipariş Detayları
          </Heading>
          
          {items.map((item, index) => (
            <Section key={index} style={itemSection}>
              <Text style={itemText}>
                <strong>{item.name}</strong>
              </Text>
              <Text style={itemText}>
                Adet: {item.quantity} × {item.price.toFixed(2)} TL = {(item.quantity * item.price).toFixed(2)} TL
              </Text>
            </Section>
          ))}
          
          <Text style={totalText}>
            <strong>Toplam: {total.toFixed(2)} TL</strong>
          </Text>
          
          <Hr style={hr} />
          
          <Heading as="h2" style={h2}>
            Teslimat Adresi
          </Heading>
          
          <Text style={address}>
            {shippingAddress.line1}
            {shippingAddress.line2 && <><br />{shippingAddress.line2}</>}
            <br />
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            <br />
            {shippingAddress.country}
          </Text>
          
          <Hr style={hr} />
          
          <Section style={buttonSection}>
            <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/admin/orders`} style={button}>
              Admin Paneline Git
            </Link>
          </Section>
          
          <Text style={footer}>
            Bu email otomatik olarak gönderilmiştir.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default AdminOrderNotification

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  margin: '4px 0',
}

const alertBox = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '5px',
  padding: '16px',
  margin: '0 40px 20px',
}

const alertText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const itemSection = {
  padding: '0 40px',
  margin: '12px 0',
}

const itemText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
}

const totalText = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '0 40px',
  marginTop: '16px',
}

const address = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
}

const buttonSection = {
  padding: '0 40px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#000',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '24px',
  textAlign: 'center' as const,
}
