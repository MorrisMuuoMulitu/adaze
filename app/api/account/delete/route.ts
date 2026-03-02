export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const body = await request.json();
    const { confirmEmail } = body;

    // Verify email matches
    if (confirmEmail !== userEmail) {
      return NextResponse.json({ 
        error: 'Email confirmation does not match' 
      }, { status: 400 });
    }

    // Soft delete via Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: 'self'
      },
    });

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error in delete route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
