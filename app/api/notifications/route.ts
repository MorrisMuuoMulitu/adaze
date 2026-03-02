export const dynamic = "force-dynamic";
import { auth } from '@/auth';
import { notificationService } from '@/lib/notificationService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const notifications = await notificationService.getAllNotifications(userId);
    
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    await notificationService.markAllAsRead(userId);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
