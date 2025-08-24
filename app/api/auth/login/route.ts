
import { NextResponse } from 'next/server';
import { users } from '../register/route'; // Import the mock user store

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Basic validation
  if (!email || !password) {
    return new NextResponse('Missing email or password', { status: 400 });
  }

  // Find user by email
  const user = users.find(u => u.email === email);

  if (!user) {
    return new NextResponse('User not found', { status: 404 });
  }

  // In a real app, you'd compare hashed passwords
  if (user.password !== password) {
    return new NextResponse('Invalid credentials', { status: 401 });
  }

  // In a real app, you'd generate and return a token here
  return NextResponse.json({ message: 'Login successful', user });
}
