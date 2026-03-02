export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Update profile via Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });

    return NextResponse.json({ 
      message: 'Account reactivated successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error in reactivate route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
