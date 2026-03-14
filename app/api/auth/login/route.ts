import { NextResponse } from 'next/server';
import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { loginRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { extractClientIP } from '@/lib/ip-utils';
import { logLoginAttempt } from '@/lib/login-tracker';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Extract client IP for rate limiting and logging
  const clientIP = extractClientIP(request.headers);

  // Apply rate limiting
  const rateLimitResult = await loginRateLimit(clientIP);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const { email, password, role } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Missing email or password' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    }) as any;

    if (!user || !user.password) {
      // Log failed attempt
      if (user) {
        await logLoginAttempt({
          userId: user.id,
          email,
          status: 'failed',
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || 'Unknown',
        }, request.headers);
      }
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      // Log failed attempt
      await logLoginAttempt({
        userId: user.id,
        email,
        status: 'failed',
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || 'Unknown',
      }, request.headers);
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

    // Log successful login
    await logLoginAttempt({
      userId: user.id,
      email,
      status: 'success',
      ipAddress: clientIP,
      userAgent: request.headers.get('user-agent') || 'Unknown',
    }, request.headers);

    return NextResponse.json({ message: 'Login successful', user: { id: user.id, email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
