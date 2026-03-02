export const dynamic = "force-dynamic";import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.platformSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching platform settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const settings = await prisma.platformSettings.update({
      where: { id: 'default' },
      data: {
        siteName: body.siteName,
        maintenanceMode: body.maintenanceMode,
        allowRegistration: body.allowRegistration,
        commissionRate: body.commissionRate,
        minWithdrawalAmount: body.minWithdrawalAmount,
        supportEmail: body.supportEmail,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error updating platform settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
