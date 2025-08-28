
import { NextResponse } from 'next/server';
import { comparePassword } from '@/lib/auth';
import { findUserByEmail } from '@/lib/user-storage';

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  // Basic validation
  if (!email || !password || !role) {
    return new NextResponse('Missing email, password or role', { status: 400 });
  }

  const user = findUserByEmail(email, role);
  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }

  // Compare hashed passwords
  if (user.password) {
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return new NextResponse('Invalid credentials', { status: 401 });
    }
  } else {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  // In a real app, you'd generate and return a token here
  return NextResponse.json({ message: 'Login successful', user });
}
