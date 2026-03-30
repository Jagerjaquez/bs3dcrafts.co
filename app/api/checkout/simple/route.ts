import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Simple checkout request:', body)

    // Just return a test URL
    return NextResponse.json({
      url: 'https://bs3dcrafts.vercel.app/success?test=true',
      message: 'Test checkout - Stripe bypass'
    })
  } catch (error) {
    console.error('Simple checkout error:', error)
    return NextResponse.json(
      { error: 'Test checkout failed' },
      { status: 500 }
    )
  }
}
