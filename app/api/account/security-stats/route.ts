import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [loginHistory, activeSessions] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { loginTime: 'desc' },
        take: 10
      }),
      prisma.session.findMany({
        where: { userId, isActive: true },
        orderBy: { lastActivityAt: 'desc' }
      })
    ]);

    return NextResponse.json({
      loginHistory,
      activeSessions
    });
  } catch (error: any) {
    console.error('Account security error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
