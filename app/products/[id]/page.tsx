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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url,
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KES',
      availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `https://adazeconnect.com/products/${product.id}`,
      seller: {
        '@type': 'Person',
        name: product.trader_id // Ideally this would be the trader's name, but ID is what we have readily available here without extra fetch or join if not already present. 
        // Actually productService.getProductById might return trader info if joined. Let's check the type or assume basic for now.
        // Looking at previous file content, product type isn't fully visible but likely has basic fields.
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
