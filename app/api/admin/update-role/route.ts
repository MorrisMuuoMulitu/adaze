export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 3. Parse the request body
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // 4. Validate and map the role
    const upperRole = role.toUpperCase();
    if (!(upperRole in Role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    const prismaRole = upperRole as Role;

    // 5. Update the user's role via Prisma
    await prisma.user.update({
      where: { id: userId },
      data: { role: prismaRole },
    });
      
    console.log(`Successfully updated user ${userId} to role ${prismaRole}`);

    return NextResponse.json({ message: 'Role updated successfully' });
  } catch (error: any) {
    console.error('Unexpected error in role update API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}