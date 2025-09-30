import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Star, 
  Heart, 
  ShoppingCart,
  Package,
  TrendingUp,
  Award,
  Zap,
  MapPin
} from 'lucide-react';
// Use the database product structure directly
interface DBProduct {
  id: string;
  trader_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  stock_quantity: number;
  rating: number;
  created_at: string;
  updated_at: string;
}
import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { createClient } from '@/lib/supabase/client';

interface FeaturedProductsProps {
  products: DBProduct[];
  loading: boolean;
  error: string | null;
}

export function FeaturedProducts({ products, loading, error }: FeaturedProductsProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [featuredProducts, setFeaturedProducts] = useState<DBProduct[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        const supabase = createClient();
        
        // Fetch random featured products from the database
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(4)
          .order('rating', { ascending: false });

        if (error) {
          throw error;
        }

        setFeaturedProducts(data as DBProduct[]);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        // Fallback to some default products if fetch fails
        setFeaturedProducts([
          {
            id: '1',
            trader_id: '00000000-0000-0000-0000-000000000001',
            name: 'Premium Leather Jacket',
            description: 'Genuine leather jacket with premium stitching and modern design.',
            price: 8999,
            category: 'Fashion',
            image_url: 'https://images.unsplash.com/photo-1521334884684-d80222895326?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            rating: 4.8,
            stock_quantity: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            trader_id: '00000000-0000-0000-0000-000000000001',
            name: 'Wireless Headphones',
            description: 'Noise-cancelling headphones with 30-hour battery life.',
            price: 12999,
            category: 'Electronics',
            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            rating: 4.6,
            stock_quantity: 25,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            trader_id: '00000000-0000-0000-0000-000000000001',
            name: 'Smart Fitness Watch',
            description: 'Track your health and fitness with advanced sensors.',
            price: 15999,
            category: 'Wearables',
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            rating: 4.7,
            stock_quantity: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            trader_id: '00000000-0000-0000-0000-000000000001',
            name: 'Designer Sunglasses',
            description: 'UV protection sunglasses with polarized lenses.',
            price: 3999,
            category: 'Accessories',
            image_url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
            rating: 4.5,
            stock_quantity: 30,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading || featuredLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Discover our most popular items
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="bg-gray-200 h-48 animate-pulse"></div>
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Featured Products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover our most popular items
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="relative">
                  <div className="h-48 bg-gray-200 relative overflow-hidden">
                    <img 
                      src={product.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=random`;
                      }}
                    />
                    {product.rating >= 4.5 && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-2 left-2 rounded-full p-2"
                    onClick={() => {
                      // Add to wishlist functionality
                      console.log('Added to wishlist:', product.id);
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3 flex-grow">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-primary">
                      KSh {product.price.toLocaleString()}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-3">
                    {product.category}
                  </Badge>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button className="w-full" asChild>
                    <Link href={`/products/${product.id}`}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      View Product
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link href="/marketplace">
              <Package className="h-5 w-5 mr-2" />
              Browse All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}