
import { Product } from '@/types';

export const products: Product[] = [
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
