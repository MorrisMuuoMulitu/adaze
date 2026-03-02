
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        trader: {
          select: {
            id: true,
            name: true,
            location: true,
            image: true,
          }
        }
      }
    });

    if (!product) {
      return new NextResponse('Product not found', { status: 404 });
    }

    // Flatten the trader info for backward compatibility if needed, 
    // or just return the product with included trader
    const formattedProduct = {
      ...product,
      location: product.trader?.location || 'Nairobi, Kenya',
    };

    return NextResponse.json(formattedProduct);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
