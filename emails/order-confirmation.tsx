/**
 * Order Confirmation Email Template
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
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

interface OrderConfirmationEmailProps {
  customerName: string
  orderNumber: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

export const OrderConfirmationEmail = ({
  customerName = 'Değerli Müşterimiz',
  orderNumber = '#12345',
  orderDate = new Date().toLocaleDateString('tr-TR'),
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  shippingAddress,
}: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Siparişiniz alındı - {orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Siparişiniz Alındı! 🎉</Heading>
          
          <Text style={text}>
            Merhaba {customerName},
          </Text>
          
          <Text style={text}>
            Siparişiniz için teşekkür ederiz. Siparişiniz başarıyla alındı ve hazırlanmaya başlandı.
          </Text>
          
          <Section style={orderInfo}>
            <Text style={orderInfoText}>
              <strong>Sipariş No:</strong> {orderNumber}
            </Text>
            <Text style={orderInfoText}>
              <strong>Sipariş Tarihi:</strong> {orderDate}
            </Text>
          </Section>
          
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
                Adet: {item.quantity} × {item.price.toFixed(2)} TL
              </Text>
              <Text style={itemTotal}>
                {(item.quantity * item.price).toFixed(2)} TL
              </Text>
            </Section>
          ))}
          
          <Hr style={hr} />
          
          <Section style={totalsSection}>
            <Text style={totalLine}>
              <span>Ara Toplam:</span>
              <span>{subtotal.toFixed(2)} TL</span>
            </Text>
            <Text style={totalLine}>
              <span>Kargo:</span>
              <span>{shipping.toFixed(2)} TL</span>
            </Text>
            <Text style={totalLineBold}>
              <span>Toplam:</span>
              <span>{total.toFixed(2)} TL</span>
            </Text>
          </Section>
          
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
          
          <Text style={text}>
            Siparişinizin durumunu takip etmek için hesabınıza giriş yapabilirsiniz.
          </Text>
          
          <Section style={buttonSection}>
            <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderNumber}`} style={button}>
              Siparişimi Takip Et
            </Link>
          </Section>
          
          <Text style={footer}>
            Herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin.
            <br />
            <Link href="mailto:support@bs3dcrafts.com">support@bs3dcrafts.com</Link>
          </Text>
          
          <Text style={footer}>
            © 2026 BS3DCrafts. Tüm hakları saklıdır.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail

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
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const orderInfo = {
  padding: '0 40px',
  margin: '16px 0',
}

const orderInfoText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
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

const itemTotal = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '4px 0',
}

const totalsSection = {
  padding: '0 40px',
  margin: '16px 0',
}

const totalLine = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
  display: 'flex',
  justifyContent: 'space-between',
}

const totalLineBold = {
  ...totalLine,
  fontSize: '16px',
  fontWeight: 'bold',
  marginTop: '12px',
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
