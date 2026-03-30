import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStripeClient } from '@/lib/stripe-client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerName, email, phone, address, items } = body

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0
    )

    // Create order
    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        address,
        totalAmount,
        status: 'pending',
        items: {
          create: items
        }
      }
    })

    // Get Stripe client
    const stripe = getStripeClient()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'try',
          product_data: {
            name: `Ürün #${item.productId}`,
          },
          unit_amount: Math.round(item.unitPrice * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        orderId: order.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}
