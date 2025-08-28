
import { NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { createUser, findUserByEmail } from '@/lib/user-storage';
import { User } from '@/types';

export async function POST(request: Request) {
  const { email, password, firstName, lastName, phone, location, userType } = await request.json();

  // Basic validation
  if (!email || !password || !firstName || !lastName || !userType) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  // Check if user already exists
  const existingUser = findUserByEmail(email, userType);
  if (existingUser) {
    return new NextResponse('User with this email and role already exists', { status: 409 });
  }

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    password, // In a real app, hash this password!
    name: `${firstName} ${lastName}`,
    firstName,
    lastName,
    phone,
    location,
    role: userType,
    isVerified: true,
    wallet: { balance: 0, currency: 'KSh' },
    preferences: { notifications: true, language: 'en', theme: 'system' },
  };

  const hashedPassword = await hashPassword(password);
  const userToStore = { ...newUser, password: hashedPassword };
  createUser(userToStore);
  return NextResponse.json({ message: 'User registered successfully', user: userToStore });
}
