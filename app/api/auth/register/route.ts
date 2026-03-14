import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { registerRateLimit } from '@/lib/rate-limit';
import { extractClientIP } from '@/lib/ip-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('🚀 [REGISTER API] Registration request received');

  // Extract client IP for rate limiting
  const clientIP = extractClientIP(request.headers);

  // Apply rate limiting (3 registrations per hour per IP)
  const rateLimitResult = await registerRateLimit(clientIP);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { message: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone, location, role } = body;

    console.log('📝 [REGISTER API] Registration data:', {
      email,
      firstName,
      lastName,
      phone,
      location,
      role,
      hasPassword: !!password,
    });

    // Basic validation
    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Map role string to Role enum
    let userRole: Role = Role.BUYER;
    if (role && role.toUpperCase() in Role) {
      userRole = role.toUpperCase() as Role;
    }

    console.log('🔐 [REGISTER API] Creating user in Prisma...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        phone,
        location,
        role: userRole,
      },
    });

    console.log('✅ [REGISTER API] Registration completed successfully', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err: any) {
    console.error('💥 [REGISTER API] Unexpected error:', err);
    return NextResponse.json({
      message: 'An unexpected error occurred during registration',
      error: err.message
    }, { status: 500 });
  }
}
