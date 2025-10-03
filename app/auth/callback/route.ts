import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/?error=auth_failed`);
    }

    // Get user to determine redirect
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const role = user.user_metadata?.role || 'buyer';
      
      // Redirect based on role
      if (role === 'buyer') {
        return NextResponse.redirect(`${origin}/marketplace`);
      } else if (role === 'trader') {
        return NextResponse.redirect(`${origin}/dashboard/trader`);
      } else if (role === 'transporter') {
        return NextResponse.redirect(`${origin}/dashboard/transporter`);
      }
    }
  }

  // Default redirect
  return NextResponse.redirect(`${origin}/marketplace`);
}
