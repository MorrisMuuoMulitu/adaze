"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  MapPin, 
  Truck, 
  Shield, 
  Clock,
  MessageCircle,
  Phone,
  Store,
  Zap,
  CheckCircle,
  AlertCircle,
  Camera,
  Ruler,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

// Mock product data - in a real app, this would come from an API
const products = [
  {
    id: 1,
    name: 'Vintage Denim Jacket',
    price: 2500,
    originalPrice: 4000,
    rating: 4.8,
    reviews: 124,
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
    ],
    category: 'Jackets',
    condition: 'Excellent',
    size: 'M',
    brand: 'Levi\'s',
    color: 'Blue',
    material: 'Denim',
    gender: 'unisex',
    description: 'Authentic vintage Levi\'s denim jacket in excellent condition. This classic piece features the iconic trucker style with button closure, chest pockets, and adjustable side tabs. Perfect for layering and adding a vintage touch to any outfit. Sourced from premium collections and thoroughly inspected for quality.',
    trader: {
      id: 'trader-1',
      name: 'Fashion Hub Nairobi',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.9,
      totalSales: 1250,
      responseTime: '< 1 hour',
      location: 'Nairobi CBD',
      verified: true,
      joinedDate: '2023-01-15'
    },
    location: 'Nairobi CBD',
    availability: 'In Stock',
    quantity: 1,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 200
    },
    features: [
      'Quality verified by ADAZE',
      'Authentic vintage piece',
      'Professional cleaning included',
      'Return guarantee'
    ],
    specifications: {
      'Size': 'Medium (M)',
      'Chest': '42 inches',
      'Length': '24 inches',
      'Sleeve': '25 inches',
      'Condition': 'Excellent (9/10)',
      'Age': '1990s vintage',
      'Care': 'Machine wash cold'
    }
  },
  {
    id: 2,
    name: 'Designer Handbag Collection',
    price: 3200,
    originalPrice: 5500,
    rating: 4.9,
    reviews: 89,
    images: [
      'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg',
      'https://images.pexels.com/photos/904350/pexels-photo-904350.jpeg'
    ],
    category: 'Bags',
    condition: 'Like New',
    size: 'Medium',
    brand: 'Michael Kors',
    color: 'Brown',
    material: 'Leather',
    gender: 'female',
    description: 'Stunning Michael Kors handbag in like-new condition. Features genuine leather construction, multiple compartments, and gold-tone hardware. Perfect for both casual and formal occasions.',
    trader: {
      id: 'trader-2',
      name: 'Premium Preloved',
      avatar: 'https://images.pexels.com/photos/3763200/pexels-photo-3763200.jpeg',
      rating: 4.8,
      totalSales: 890,
      responseTime: '< 2 hours',
      location: 'Westlands, Nairobi',
      verified: true,
      joinedDate: '2023-03-20'
    },
    location: 'Westlands, Nairobi',
    availability: 'In Stock',
    quantity: 1,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 250
    },
    features: [
      'Authentic designer piece',
      'Like-new condition',
      'Dust bag included',
      'Certificate of authenticity'
    ],
    specifications: {
      'Dimensions': '30cm x 25cm x 15cm',
      'Material': 'Genuine Leather',
      'Hardware': 'Gold-tone',
      'Closure': 'Zip top',
      'Compartments': '3 main + 2 side pockets',
      'Strap': 'Adjustable shoulder strap',
      'Condition': 'Like New (9.5/10)'
    }
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

const getGenderIcon = (gender: string) => {
  switch (gender) {
    case 'male':
      return '👦';
    case 'female':
      return '👧';
    case 'unisex':
      return '👫';
    default:
      return '👤';
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch product
    const productId = parseInt(params.id as string);
    const foundProduct = products.find(p => p.id === productId);
    
    setTimeout(() => {
      setProduct(foundProduct);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const handleAddToCart = () => {
    toast.success('Added to cart!', {
      description: `${product.name} has been added to your cart.`
    });
  };

  const handleBuyNow = () => {
    toast.success('Redirecting to checkout...', {
      description: 'You will be redirected to complete your purchase.'
    });
  };

  const handleContactTrader = () => {
    toast.info('Opening chat...', {
      description: `Starting conversation with ${product.trader.name}`
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name} on ADAZE`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 mobile-button"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFavorite(!isFavorite)}
                className="mobile-button"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="mobile-button"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden relative group">
              <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${product.images[selectedImage]})` }}
              />
              
              {/* Image Navigation */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {product.images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === selectedImage ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                <Badge className="bg-primary text-primary-foreground">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {product.condition}
                </Badge>
              </div>

              {/* Quality Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      index === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="mb-2">
                  {product.category}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Badge className={`gender-badge ${getGenderBadgeStyle(product.gender)}`}>
                    {getGenderIcon(product.gender)} {getGenderLabel(product.gender)}
                  </Badge>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-primary">
                  KSh {product.price.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  KSh {product.originalPrice.toLocaleString()}
                </span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Save KSh {(product.originalPrice - product.price).toLocaleString()}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>{product.brand}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Ruler className="h-4 w-4" />
                  <span>Size {product.size}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{product.location}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold">Key Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Options */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Delivery Options
                </h3>
                <div className="space-y-2">
                  {product.shipping.sameDay && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Same-day delivery</span>
                      </div>
                      <span className="text-sm font-medium">+KSh 500</span>
                    </div>
                  )}
                  {product.shipping.nextDay && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Next-day delivery</span>
                      </div>
                      <span className="text-sm font-medium">+KSh {product.shipping.cost}</span>
                    </div>
                  )}
                  {product.shipping.standard && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Standard delivery (2-3 days)</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">Free</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex space-x-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 h-12 mobile-button"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 african-gradient text-white h-12 mobile-button"
                >
                  Buy Now
                </Button>
              </div>
              
              <Button
                onClick={handleContactTrader}
                variant="outline"
                className="w-full h-12 mobile-button"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Trader
              </Button>
            </div>

            {/* Trader Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.trader.avatar} />
                    <AvatarFallback>{product.trader.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{product.trader.name}</h4>
                      {product.trader.verified && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.trader.rating}</span>
                      </div>
                      <span>{product.trader.totalSales} sales</span>
                      <span>Responds in {product.trader.responseTime}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{product.trader.location}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mobile-button">
                    <Store className="h-4 w-4 mr-1" />
                    View Shop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Product Description & Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 space-y-8"
        >
          <Separator />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Specifications</h2>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border/50">
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}