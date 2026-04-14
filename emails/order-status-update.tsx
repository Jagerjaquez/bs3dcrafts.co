import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from '@react-email/components'

interface OrderStatusUpdateEmailProps {
  customerName: string
  orderId: string
  status: string
  statusText: string
  trackingNumber?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
}

export default function OrderStatusUpdateEmail({
  customerName = 'Müşteri',
  orderId = 'ORDER123',
  status = 'shipped',
  statusText = 'Kargoya Verildi',
  trackingNumber,
  items = [],
  totalAmount = 0,
}: OrderStatusUpdateEmailProps) {
  const previewText = `Siparişiniz ${statusText} durumuna güncellendi`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>BS3DCRAFTS.CO</Heading>
          </Section>

          <Section style={content}>
            <Heading style={h2}>Sipariş Durumu Güncellendi</Heading>
            
            <Text style={text}>
              Merhaba {customerName},
            </Text>
            
            <Text style={text}>
              <strong>{orderId}</strong> numaralı siparişinizin durumu güncellendi.
            </Text>

            <Section style={statusBox}>
              <Text style={statusTextStyle}>
                Yeni Durum: <strong>{statusText}</strong>
              </Text>
              {trackingNumber && (
                <Text style={trackingTextStyle}>
                  Takip Numarası: <strong>{trackingNumber}</strong>
                </Text>
              )}
            </Section>

            {status === 'shipped' && (
              <Text style={text}>
                🚚 Siparişiniz kargoya verilmiştir. Takip numaranızı kullanarak 
                kargo durumunuzu takip edebilirsiniz.
              </Text>
            )}

            {status === 'completed' && (
              <Text style={text}>
                🎉 Siparişiniz tamamlanmıştır. BS3DCRAFTS.CO'yu tercih ettiğiniz için teşekkür ederiz!
              </Text>
            )}

            {status === 'cancelled' && (
              <Text style={text}>
                ❌ Siparişiniz iptal edilmiştir. Herhangi bir ödeme yaptıysanız, 
                iade işlemi başlatılacaktır.
              </Text>
            )}

            <Hr style={hr} />

            <Heading style={h3}>Sipariş Detayları</Heading>
            
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemName}>
                  {item.name}
                </Column>
                <Column style={itemQuantity}>
                  {item.quantity} adet
                </Column>
                <Column style={itemPrice}>
                  ₺{item.price.toFixed(2)}
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <Row style={totalRow}>
              <Column>
                <Text style={totalTextStyle}>
                  <strong>Toplam: ₺{totalAmount.toFixed(2)}</strong>
                </Text>
              </Column>
            </Row>

            <Hr style={hr} />

            <Text style={footer}>
              Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz.
              <br />
              <br />
              BS3DCRAFTS.CO Ekibi
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 24px',
  backgroundColor: '#1f2937',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '0 24px',
}

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
}

const h3 = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
}

const text = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
}

const statusBox = {
  backgroundColor: '#f3f4f6',
  padding: '16px',
  borderRadius: '8px',
  margin: '24px 0',
}

const statusTextStyle = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const trackingTextStyle = {
  color: '#1f2937',
  fontSize: '14px',
  margin: '0',
}

const itemRow = {
  padding: '8px 0',
  borderBottom: '1px solid #e5e7eb',
}

const itemName = {
  color: '#374151',
  fontSize: '14px',
  width: '60%',
}

const itemQuantity = {
  color: '#6b7280',
  fontSize: '14px',
  width: '20%',
  textAlign: 'center' as const,
}

const itemPrice = {
  color: '#374151',
  fontSize: '14px',
  width: '20%',
  textAlign: 'right' as const,
}

const totalRow = {
  padding: '16px 0',
}

const totalTextStyle = {
  color: '#1f2937',
  fontSize: '16px',
  textAlign: 'right' as const,
  margin: '0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
}