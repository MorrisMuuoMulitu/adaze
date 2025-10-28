import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This needs to be set in environment
    );

    // Get the current user to verify admin status
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { session } } = await adminClient.auth.getSession();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the current user is an admin by checking their profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, role } = await request.json();

    if (!userId || !role) {
      return Response.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // Validate that the role is one of the allowed values
    const allowedRoles = ['buyer', 'trader', 'transporter', 'admin', 'wholesaler'];
    if (!allowedRoles.includes(role)) {
      return Response.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    // Update the user's role using service role
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return Response.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return Response.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error in role update API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}