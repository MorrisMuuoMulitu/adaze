import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('API /api/products: Starting fetch...');
    
    let page = 1;
    let limit = 12;
    let offset = 0;

    try {
      // Handle potential URL parsing errors
      const url = new URL(request.url);
      const searchParams = url.searchParams;
      page = parseInt(searchParams.get('page') || '1');
      limit = parseInt(searchParams.get('limit') || '12');
      
      // Parse filter params
      const category = searchParams.get('category');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const sortBy = searchParams.get('sortBy') || 'newest';

      // Validate parsed values
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 12;
      if (limit > 50) limit = 50; // Cap limit to prevent abuse

      offset = (page - 1) * limit;
      console.log(`API /api/products: Params - Page: ${page}, Limit: ${limit}, Offset: ${offset}, Category: ${category}, Sort: ${sortBy}`);
    } catch (e) {
      console.error('API /api/products: Error parsing URL parameters:', e);
      // Fallback to defaults is already handled by initializers
    }

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
    
    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        trader:profiles!trader_id (
          is_suspended,
          location
        )
      `)
      .eq('status', 'active');

    // Apply filters
    if (request.url.includes('category') && new URL(request.url).searchParams.get('category')) {
       query = query.eq('category', new URL(request.url).searchParams.get('category'));
    }
    
    if (request.url.includes('minPrice')) {
       const min = parseInt(new URL(request.url).searchParams.get('minPrice') || '0');
       if (!isNaN(min)) query = query.gte('price', min);
    }

    if (request.url.includes('maxPrice')) {
       const max = parseInt(new URL(request.url).searchParams.get('maxPrice') || '1000000');
       if (!isNaN(max)) query = query.lte('price', max);
    }

    // Apply sorting
    const sortParam = new URL(request.url).searchParams.get('sortBy') || 'newest';
    switch (sortParam) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('API /api/products: Supabase error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    console.log(`API /api/products: Fetched ${data?.length || 0} products (Page ${page})`);

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
