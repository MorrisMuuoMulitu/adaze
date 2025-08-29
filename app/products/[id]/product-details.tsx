
"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
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
import { Product } from '@/types';
import { addToCart } from '@/lib/cart';
import { useAuth } from '@/hooks/use-auth'; // Import the auth hook

export default function ProductDetails({ product, getGenderBadgeStyle, getGenderLabel, getGenderIcon }: { product: Product, getGenderBadgeStyle: (gender: string) => string, getGenderLabel: (gender: string) => string, getGenderIcon: (gender: string) => string }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity, isAuthenticated);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
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
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                    <Image
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, (max-width: 1200px) 12vw, 8vw"
                      className="object-cover"
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
                {product.features.map((feature: string, index: number) => (
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
                    <span className="text-muted-foreground">{value as string}</span>
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
