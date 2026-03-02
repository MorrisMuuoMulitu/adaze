export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { businessName, phone, location } = await request.json();

    const userId = session.user.id;

    // Upgrade user to TRADER role and update profile info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        role: Role.TRADER,
        name: businessName || session.user.name,
        phone: phone || undefined,
        location: location || undefined,
      },
    });

    return NextResponse.json({ 
      message: 'Account upgraded to Trader successfully',
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        name: updatedUser.name
      }
    });
  } catch (error: any) {
    console.error('Error upgrading to trader:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
