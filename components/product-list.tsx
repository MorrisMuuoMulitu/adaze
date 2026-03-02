import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/products/add-to-cart-button'
import Image from 'next/image'

export async function ProductList() {
  const products = await prisma.product.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
  })

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 italic">
        No items listed yet. Be the first!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden border-white/20 backdrop-blur-sm bg-white/50 hover:shadow-2xl transition-all duration-300 rounded-xl">
          <CardHeader className="p-0 overflow-hidden relative aspect-square">
            {product.imageUrl ? (
              <Image 
                src={product.imageUrl} 
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                Placeholder
              </div>
            )}
            <Badge className="absolute top-2 right-2 bg-black/50 text-white backdrop-blur-md">
              {product.category}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
            <p className="text-2xl font-bold mt-2 text-purple-600">
              KES {Number(product.price).toLocaleString()}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <AddToCartButton productId={product.id} productName={product.name} />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
