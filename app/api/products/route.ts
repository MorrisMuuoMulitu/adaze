import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let page = parseInt(searchParams.get('page') || '1');
    let limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const isFeatured = searchParams.get('featured') === 'true';

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 12;
    if (limit > 50) limit = 50;

    const offset = (page - 1) * limit;

    const where: any = {
      stockQuantity: { gt: 0 },
    };

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        trader: {
          select: { id: true, location: true, name: true }
        }
      }
    });

    const activeProducts = products.map(product => ({
      ...product,
      traderId: product.traderId,
      location: product.trader?.location || 'Nairobi, Kenya',
      trader: undefined
    }));

    return NextResponse.json(activeProducts);
  } catch (error: any) {
    console.error('API /api/products: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}
