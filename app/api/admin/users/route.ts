import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all auth users (we can only get basic info without admin API key)
    // So we'll get profiles which should have email stored or use a workaround
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id');

    // For each profile, we need to get the email from auth.users
    // Since we can't use admin API client-side, we'll create a database function
    // For now, return profile IDs and the component will handle it
    
    // Alternative: Use a stored procedure to get emails
    const { data: userEmails, error } = await supabase.rpc('get_user_emails');
    
    if (error) {
      console.error('Error fetching user emails:', error);
      // Return error details for debugging
      return NextResponse.json({ 
        error: 'Failed to fetch user emails', 
        details: error.message,
        code: error.code,
        hint: error.hint 
      }, { status: 500 });
    }

    return NextResponse.json(userEmails || []);
  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
