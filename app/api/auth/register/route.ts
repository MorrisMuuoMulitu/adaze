
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  console.log('🚀 [REGISTER API] Registration request received');
  
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
      passwordLength: password?.length
    });

    // Basic validation
    if (!email || !password || !firstName || !lastName || !role) {
      console.error('❌ [REGISTER API] Missing required fields:', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasFirstName: !!firstName,
        hasLastName: !!lastName,
        hasRole: !!role
      });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    console.log('✅ [REGISTER API] Validation passed, creating Supabase client...');
    const supabase = await createClient();
    
    console.log('🔐 [REGISTER API] Calling Supabase signUp...');
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
      console.error('❌ [REGISTER API] Supabase signUp error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        cause: error.cause
      });
      return NextResponse.json({ message: error.message }, { status: error.status || 500 });
    }

    console.log('✅ [REGISTER API] Supabase signUp successful:', {
      userId: data.user?.id,
      email: data.user?.email,
      confirmed: data.user?.email_confirmed_at,
      identities: data.user?.identities?.length,
      session: data.session ? 'Session created' : 'No session'
    });

    // Check if user was created but needs email confirmation
    if (data.user && !data.session) {
      console.warn('⚠️ [REGISTER API] User created but no session (email confirmation required)');
      return NextResponse.json({ 
        message: 'User registered successfully. Please check your email to confirm your account before signing in.',
        user: data.user,
        needsConfirmation: true
      });
    }

    // Check if profile was created
    console.log('🔍 [REGISTER API] Checking if profile was created...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user?.id)
      .single();

    if (profileError) {
      console.error('❌ [REGISTER API] Profile check error:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint
      });
    } else if (profile) {
      console.log('✅ [REGISTER API] Profile created successfully:', {
        profileId: profile.id,
        role: profile.role,
        fullName: profile.full_name
      });
    } else {
      console.warn('⚠️ [REGISTER API] No profile found for user');
    }

    console.log('🎉 [REGISTER API] Registration completed successfully');
    // The user is signed up, and the trigger has created their profile.
    return NextResponse.json({ 
      message: 'User registered successfully. Please check your email to confirm.', 
      user: data.user,
      profile: profile 
    });
  } catch (err: any) {
    console.error('💥 [REGISTER API] Unexpected error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return NextResponse.json({ 
      message: 'An unexpected error occurred during registration',
      error: err.message 
    }, { status: 500 });
  }
}
