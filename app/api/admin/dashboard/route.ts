import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminAuth(request)
    if (authError) return authError

    // Fetch all dashboard data in parallel with optimized queries
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      userCount,
      ordersByStatus,
      recentOrders,
      systemStatus
    ] = await Promise.all([
      // Total products - optimized with select
      prisma.product.count({
        where: { status: 'published' }
      }),
      
      // Total orders - optimized with select
      prisma.order.count(),
      
      // Total revenue (only paid orders) - optimized query
      prisma.order.aggregate({
        where: { status: { in: ['paid', 'shipped', 'completed'] } },
        _sum: { totalAmount: true }
      }),
      
      // Low stock products (5 or less) - optimized with select
      prisma.product.count({
        where: { 
          stock: { lte: 5 },
          status: 'published'
        }
      }),
      
      // User count (from orders - unique customers) - optimized query
      prisma.order.findMany({
        select: { email: true },
        distinct: ['email']
      }).then(result => result.length),
      
      // Orders by status - optimized groupBy
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Recent orders (last 5) - optimized with select only needed fields
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          email: true,
          totalAmount: true,
          status: true,
          createdAt: true
        }
      }),
      
      // System status checks
      checkSystemStatus()
    ])

    // Transform orders by status into object
    const statusCounts = {
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0
    }

    ordersByStatus.forEach(item => {
      if (item.status in statusCounts) {
        statusCounts[item.status as keyof typeof statusCounts] = item._count.status
      }
    })

    const dashboardData = {
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      lowStockProducts,
      userCount,
      ordersByStatus: statusCounts,
      recentOrders,
      systemStatus
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Dashboard verileri alınamadı' },
      { status: 500 }
    )
  }
}

async function checkSystemStatus() {
  const status = {
    database: true,
    storage: true,
    email: true
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    console.error('Database health check failed:', error)
    status.database = false
  }

  try {
    // Test storage connection (Supabase)
    const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (storageUrl) {
      const response = await fetch(`${storageUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        }
      })
      status.storage = response.ok
    }
  } catch (error) {
    console.error('Storage health check failed:', error)
    status.storage = false
  }

  try {
    // Test email configuration (just check if env vars exist)
    const emailConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    )
    status.email = emailConfigured
  } catch (error) {
    console.error('Email health check failed:', error)
    status.email = false
  }

  return status
}