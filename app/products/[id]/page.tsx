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

import ProductDetails from './product-details';
import { Product } from '@/types';

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

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/products/${id}`);
        if (!res.ok) {
          throw new Error('Product not found or API error');
        }
        const data: Product = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Product not found</h2>
          <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist or an error occurred.</p>
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return <ProductDetails product={product} getGenderBadgeStyle={getGenderBadgeStyle} getGenderLabel={getGenderLabel} getGenderIcon={getGenderIcon} />;
}