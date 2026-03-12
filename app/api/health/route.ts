import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Test DB
    const start = Date.now();
    const productCount = await prisma.product.count();
    const dbTime = Date.now() - start;

    // 2. Check essential ENV vars (masking values)
    const envStatus = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      AUTH_SECRET: !!process.env.AUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not Set',
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: 'Elite Protocol Operational',
      database: {
        connected: true,
        count: productCount,
        latency: `${dbTime}ms`,
      },
      environment: envStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'Protocol Compromised',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}
