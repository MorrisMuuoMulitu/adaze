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

export default async function ProductPage({ params }: { params: { id: string } }) {
  const res = await fetch(`http://localhost:3000/api/products/${params.id}`);
  
  if (!res.ok) {
    // Handle cases where the product is not found or API call fails
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

  const product: Product = await res.json();

  return <ProductDetails product={product} getGenderBadgeStyle={getGenderBadgeStyle} getGenderLabel={getGenderLabel} getGenderIcon={getGenderIcon} />;
}