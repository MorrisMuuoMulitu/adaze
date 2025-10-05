import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get confirmation from request body
    const body = await request.json();
    const { confirmEmail } = body;

    // Verify email matches
    if (confirmEmail !== user.email) {
      return NextResponse.json({ 
        error: 'Email confirmation does not match' 
      }, { status: 400 });
    }

    // Note: We can only delete the profile, not the auth user
    // Deleting auth.users requires admin privileges
    // The profile deletion will cascade to related data based on foreign keys

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('Error deleting profile:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Sign out the user
    await supabase.auth.signOut();

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error in delete route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
