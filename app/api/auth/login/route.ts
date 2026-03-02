import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    }) as any;

    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (role && user.role !== role && user.role !== 'ADMIN') {
      return NextResponse.json({ 
        message: `Access denied. You are registered as a ${user.role}, not a ${role}.` 
      }, { status: 403 });
    }

    await signIn('credentials', { 
      email, 
      password, 
      redirect: false 
    });

    return NextResponse.json({ message: 'Login successful', user: { id: user.id, email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
