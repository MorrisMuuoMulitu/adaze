import { productService, Product } from '@/lib/productService';
import ProductDetailClient from './product-detail-client';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const product = await productService.getProductById(id);

  if (!product) {
    return {
      title: 'Product not found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${product.name} - ADAZE`,
    description: product.description,
    openGraph: {
      title: `${product.name} - ADAZE`,
      description: product.description,
      images: [
        {
          url: product.image_url || '/og-image.png',
          width: 1200,
          height: 630,
          alt: product.name,
        },
        ...previousImages,
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await productService.getProductById(params.id);

  if (!product) {
    return <div>Product not found</div>;
  }

  return <ProductDetailClient product={product} />;
}
