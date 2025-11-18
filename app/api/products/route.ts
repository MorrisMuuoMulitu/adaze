import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('API /api/products: Starting fetch...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('API /api/products: Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Configuration Error', 
        message: 'Missing Supabase environment variables' 
      }, { status: 500 });
    }
    
    // Use direct Supabase client to avoid cookie/SSR issues in API route
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch active products from non-suspended traders
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        trader:profiles!trader_id (
          is_suspended,
          location
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('API /api/products: Supabase error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log(`API /api/products: Fetched ${data?.length || 0} products`);

    // Filter out products from suspended traders
    const activeProducts = (data || []).filter(
      (product: any) => !product.trader?.is_suspended
    ).map((product: any) => ({
      ...product,
      location: product.trader?.location || 'Nairobi, Kenya'
    }));

    return NextResponse.json(activeProducts);
  } catch (error: any) {
    console.error('API /api/products: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
