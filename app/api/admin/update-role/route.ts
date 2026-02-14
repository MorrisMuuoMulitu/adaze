import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    // 1. Create a server-side Supabase client to verify the current user's session
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error in update-role:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if the current user is an admin by checking their profile in the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.error('Admin check failed:', profileError, profile?.role);
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 3. Parse the request body
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // 4. Validate that the role is one of the allowed values
    const allowedRoles = ['buyer', 'trader', 'transporter', 'admin', 'wholesaler'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // 5. Update the user's role
    // We prioritize using the SERVICE_ROLE_KEY if it exists to bypass RLS policies
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceRoleKey) {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
      );

      const { error: updateError } = await adminClient
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating role with service role:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update role in database', 
          details: updateError.message 
        }, { status: 500 });
      }
      
      console.log(`Successfully updated user ${userId} to role ${role} (using service role)`);
    } else {
      // Fallback: try updating with the user's own session
      // Note: This will only work if Supabase RLS policies allow an 'admin' role to update other profiles.
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating role without service role:', updateError);
        return NextResponse.json({ 
          error: 'Internal Authorization Error: SUPABASE_SERVICE_ROLE_KEY is missing, and database policies blocked the update.', 
          details: updateError.message 
        }, { status: 500 });
      }
      
      console.log(`Successfully updated user ${userId} to role ${role} (using admin session)`);
    }

    return NextResponse.json({ message: 'Role updated successfully' });
  } catch (error: any) {
    console.error('Unexpected error in role update API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}