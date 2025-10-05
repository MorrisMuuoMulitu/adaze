import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { email, password, role } = await request.json();

  // Basic validation
  if (!email || !password || !role) {
    return NextResponse.json({ message: 'Missing email, password, or role' }, { status: 400 });
  }

  const supabase = await createClient();

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

  // 2. Get the user's profile to verify their role, suspension, and deletion status
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_suspended, is_deleted, login_count')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    // Sign out the user if their profile is missing/deleted
    await supabase.auth.signOut();
    
    // If profile doesn't exist, the account was likely deleted
    if (profileError.code === 'PGRST116') {
      return NextResponse.json({ 
        message: 'This account has been deleted. Please create a new account if you wish to continue.' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Error verifying user profile. Please contact support.' }, { status: 500 });
  }

  // Check if profile exists
  if (!profileData) {
    await supabase.auth.signOut();
    return NextResponse.json({ 
      message: 'This account has been deleted. Please create a new account if you wish to continue.' 
    }, { status: 404 });
  }

  // 3. Check if the account is deleted (soft delete)
  if (profileData.is_deleted) {
    await supabase.auth.signOut();
    return NextResponse.json({ 
      message: 'This account has been deleted. Please create a new account if you wish to continue.' 
    }, { status: 404 });
  }

  // 4. Check if the account is suspended
  if (profileData.is_suspended) {
    // Sign out the user as their account is suspended
    await supabase.auth.signOut();
    return NextResponse.json({ 
      message: 'Your account has been suspended. Please contact support for assistance.' 
    }, { status: 403 });
  }

  // 5. Check if the user's stored role matches the role they are trying to log in with
  if (profileData.role !== role) {
    // Sign out the user as they are trying to access an unauthorized role
    await supabase.auth.signOut();
    return NextResponse.json({ 
      message: `Access denied. You are registered as a ${profileData.role}, not a ${role}. Please select the correct role.` 
    }, { status: 403 });
  }

  // 6. Update login tracking (last login time and increment login count)
  try {
    await supabase
      .from('profiles')
      .update({ 
        last_login_at: new Date().toISOString(),
        login_count: (profileData.login_count || 0) + 1
      })
      .eq('id', authData.user.id);
  } catch (error) {
    // Log error but don't fail the login
    console.error('Error updating login tracking:', error);
  }

  // 7. If roles match and account is not suspended or deleted, login is successful
  return NextResponse.json({ message: 'Login successful', user: authData.user });
}