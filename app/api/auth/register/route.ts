
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, password, firstName, lastName, phone, location, role } = await request.json();

  // Basic validation
  if (!email || !password || !firstName || !lastName || !role) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        phone,
        location,
        role: role,
      },
    },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: error.status || 500 });
  }

  // The user is signed up, and the trigger has created their profile.
  // Supabase sends a confirmation email by default.
  return NextResponse.json({ message: 'User registered successfully. Please check your email to confirm.', user: data.user });
}
