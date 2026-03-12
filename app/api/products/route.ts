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
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const isFeatured = searchParams.get('featured') === 'true';

    const traderId = searchParams.get('traderId');
    const isManagement = searchParams.get('management') === 'true';

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 12;
    if (limit > 100) limit = 100;

    const offset = (page - 1) * limit;

    const where: any = {};
    
    // Only filter by active/in-stock for public browsing
    if (!isManagement && !traderId) {
      where.stockQuantity = { gt: 0 };
      where.status = 'ACTIVE';
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (traderId) {
      where.traderId = traderId;
    }

    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.traderId || !body.name || !body.price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        traderId: body.traderId,
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        imageUrl: body.imageUrl,
        stockQuantity: body.stockQuantity || 0,
        status: body.status || 'ACTIVE',
        rating: 0,
      }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API /api/products POST: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}
