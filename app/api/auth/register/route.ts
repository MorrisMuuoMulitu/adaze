
import { NextResponse } from 'next/server';
import { User } from '@/types';

// Mock in-memory user store for demo purposes
export const users: User[] = [];

export async function POST(request: Request) {
  const { email, password, firstName, lastName, phone, location, userType } = await request.json();

  // Basic validation
  if (!email || !password || !firstName || !lastName || !userType) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  // Check if user already exists
  if (users.some(user => user.email === email)) {
    return new NextResponse('User with this email already exists', { status: 409 });
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

  users.push(newUser);

  // In a real app, you'd return a token here
  return NextResponse.json({ message: 'User registered successfully', user: newUser });
}
