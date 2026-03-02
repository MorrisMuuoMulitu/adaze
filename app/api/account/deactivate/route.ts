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

    // Update profile to mark as suspended via Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isSuspended: true,
        suspendedAt: new Date(),
        suspendedBy: 'self'
      },
    });

    // In Auth.js, sign out is usually handled on the client 
    // but the session will be invalid if we check isSuspended in callbacks
    
    return NextResponse.json({ 
      message: 'Account deactivated successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error in deactivate route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
