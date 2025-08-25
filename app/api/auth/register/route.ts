
import { NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { createUser, findUserByEmail } from '@/lib/user-storage';
import { User } from '@/types';

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone, location, userType } = await request.json();

    // Basic validation
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
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

    console.log('Attempting to register user:', email); // Log the email being registered
    console.log('Raw Password:', password); // Log the raw password
    const hashedPassword = await hashPassword(password);
    console.log('Hashed Password:', hashedPassword); // Log the hashed password
    const userToStore = { ...newUser, password: hashedPassword };
    createUser(userToStore);

    // Generate JWT token
    const token = generateToken(userToStore);

    return NextResponse.json({ 
      message: 'User registered successfully', 
      user: {
        id: userToStore.id,
        email: userToStore.email,
        name: userToStore.name,
        role: userToStore.role,
        isVerified: userToStore.isVerified
      },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
