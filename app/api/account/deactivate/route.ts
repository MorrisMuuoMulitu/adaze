import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update profile to mark as suspended
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_by: 'self' // Track that user suspended their own account
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error deactivating account:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ 
      message: 'Account deactivated successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error in deactivate route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
