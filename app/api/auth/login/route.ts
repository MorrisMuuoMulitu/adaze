import { NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/user-storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email as string;
    const password = body.password as string;

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    console.log('Attempting to log in user:', email); // Log the email being logged in
    
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare hashed passwords
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Customize response based on user role
    let welcomeMessage = 'Login successful';
    
    switch (user.role) {
      case 'buyer':
        welcomeMessage = 'Welcome back, valued buyer! Browse our marketplace for amazing deals.';
        break;
      case 'trader':
        welcomeMessage = 'Welcome back, trader! Manage your products and grow your business.';
        break;
      case 'transporter':
        welcomeMessage = 'Welcome back, transporter! Check available delivery opportunities.';
        break;
    }

    return NextResponse.json({ 
      message: welcomeMessage, 
      user: { 
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
