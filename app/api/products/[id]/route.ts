
import { NextResponse } from 'next/server';
import { products } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  const product = products.find(p => p.id === productId);

  if (product) {
    return NextResponse.json(product);
  } else {
    return new NextResponse('Product not found', { status: 404 });
  }
}
