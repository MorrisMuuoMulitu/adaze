"use client"

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, ShoppingCart, Eye, MapPin } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 2500,
    originalPrice: 4000,
    rating: 4.8,
    reviews: 124,
    image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    category: 'Jackets',
    condition: 'Excellent',
    size: 'M',
    gender: 'unisex',
    trader: 'Fashion Hub Nairobi',
    location: 'Nairobi CBD'
  },
  {
    id: 2,
    name: 'Designer Handbag Collection',
    price: 3200,
    originalPrice: 5500,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg',
    category: 'Bags',
    condition: 'Like New',
    gender: 'female',
    trader: 'Premium Preloved',
    location: 'Westlands, Nairobi'
  },
  {
    id: 3,
    name: 'Casual Summer Dress',
    price: 1800,
    originalPrice: 3000,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg',
    category: 'Dresses',
    condition: 'Good',
    size: 'S-L',
    gender: 'female',
    trader: 'Mama Jane\'s Fashion',
    location: 'Kisumu'
  },
  {
    id: 4,
    name: 'Business Formal Suits',
    price: 4500,
    originalPrice: 8000,
    rating: 4.6,
    reviews: 67,
    image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
    category: 'Suits',
    condition: 'Excellent',
    size: 'Various',
    gender: 'male',
    trader: 'Executive Wear Ltd',
    location: 'Mombasa'
  },
  {
    id: 5,
    name: 'Sneaker Collection',
    price: 2800,
    originalPrice: 4500,
    rating: 4.8,
    reviews: 203,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    category: 'Shoes',
    condition: 'Very Good',
    size: '38-44',
    gender: 'unisex',
    trader: 'Kicks & More',
    location: 'Eldoret'
  },
  {
    id: 6,
    name: 'Traditional Print Tops',
    price: 1500,
    originalPrice: 2800,
    rating: 4.9,
    reviews: 91,
    image: 'https://images.pexels.com/photos/9558599/pexels-photo-9558599.jpeg',
    category: 'Tops',
    condition: 'Excellent',
    size: 'XS-XL',
    gender: 'female',
    trader: 'African Elegance',
    location: 'Nakuru'
  }
];

const getGenderBadgeStyle = (gender: string) => {
  switch (gender) {
    case 'male':
      return 'boys-enhanced gender-badge-enhanced gender-text-enhanced';
    case 'female':
      return 'girls-enhanced gender-badge-enhanced gender-text-enhanced';
    case 'unisex':
      return 'unisex-enhanced gender-badge-enhanced gender-text-enhanced';
    default:
      return 'bg-gray-500 text-white hover:bg-gray-600 gender-text-enhanced';
  }
};

const getGenderLabel = (gender: string) => {
  switch (gender) {
    case 'male':
      return 'Boys';
    case 'female':
      return 'Girls';
    case 'unisex':
      return 'Unisex';
    default:
      return 'All';
  }
};

export function FeaturedProducts() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          {/* Gender Filter Buttons */}
          <div className="flex justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            <Button variant="outline" className="filter-button-boys mobile-button">
              👦 Boys Fashion
            </Button>
            <Button variant="outline" className="filter-button-girls mobile-button">
              👧 Girls Fashion
            </Button>
            <Button variant="outline" className="filter-button-unisex mobile-button">
              👫 Unisex
            </Button>
            <Button variant="outline" className="mobile-button">
              All Items
            </Button>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Featured Products from Kenya
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Discover handpicked quality items for boys, girls, and everyone from verified traders across all 47 counties in Kenya
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm card-shadow hover:card-shadow-lg">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="relative overflow-hidden cursor-pointer">
                    <div 
                      className="aspect-square bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Quick actions */}
                    <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full glass-effect mobile-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-full glass-effect mobile-button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 space-y-2">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </Badge>
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-xs">
                        {product.condition}
                      </Badge>
                      <Badge className={`text-xs gender-badge ${getGenderBadgeStyle(product.gender)}`}>
                        {getGenderLabel(product.gender)}
                      </Badge>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <Badge variant="outline" className="text-xs mb-2">
                          {product.category}
                        </Badge>
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-semibold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs sm:text-sm font-medium ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        ({product.reviews} reviews)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg sm:text-2xl font-bold text-primary">
                          KSh {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">
                          KSh {product.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {product.size && `Size: ${product.size} • `}
                        <span className="inline-flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {product.location}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        by {product.trader}
                      </div>
                    </div>

                    <Button 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors h-10 sm:h-12 mobile-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 sm:mt-12"
        >
          <Button size="lg" variant="outline" className="group h-12 mobile-button">
            View All Products in Kenya
            <motion.div
              className="ml-2"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              →
            </motion.div>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}