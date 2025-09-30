import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  // Basic validation
  if (!email || !password || !role) {
    return NextResponse.json({ message: 'Missing email, password, or role' }, { status: 400 });
  }

  const supabase = createClient();

  // 1. Sign in the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return NextResponse.json({ message: authError.message }, { status: authError.status || 401 });
  }

  if (!authData.user) {
    return NextResponse.json({ message: 'Authentication failed: no user data returned' }, { status: 401 });
  }

  // 2. Get the user's profile to verify their role
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    // Sign out the user if their profile is missing, as this is an inconsistent state
    await supabase.auth.signOut();
    return NextResponse.json({ message: 'Error verifying user profile. Please contact support.' }, { status: 500 });
  }

  // 3. Check if the user's stored role matches the role they are trying to log in with
  if (profileData.role !== role) {
    // Sign out the user as they are trying to access an unauthorized role
    await supabase.auth.signOut();
    return NextResponse.json({ 
      message: `Access denied. You are registered as a ${profileData.role}, not a ${role}. Please select the correct role.` 
    }, { status: 403 });
  }

  // 4. If roles match, login is successful
  return NextResponse.json({ message: 'Login successful', user: authData.user });
}