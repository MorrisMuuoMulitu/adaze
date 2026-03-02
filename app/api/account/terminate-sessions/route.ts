import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Terminate all active sessions for this user
    await prisma.session.updateMany({
      where: { 
        userId: userId,
        isActive: true
      },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session termination error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
