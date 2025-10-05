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

    // Update profile to mark as active
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_suspended: false })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error reactivating account:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Account reactivated successfully',
      success: true 
    });
  } catch (error: any) {
    console.error('Error in reactivate route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
