export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { LoginStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      suspiciousActivities,
      totalLogins,
      failedLogins,
      blockedUsers
    ] = await Promise.all([
      prisma.suspiciousActivity.findMany({
        include: { user: { select: { email: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.loginHistory.count({ where: { status: LoginStatus.SUCCESS } }),
      prisma.loginHistory.count({ where: { status: LoginStatus.FAILED } }),
      prisma.user.count({ where: { isSuspended: true } })
    ]);

    return NextResponse.json({
      suspiciousActivities,
      stats: {
        totalLogins,
        failedLogins,
        blockedUsers,
        suspiciousToday: suspiciousActivities.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length
      }
    });
  } catch (error: any) {
    console.error('Security stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
