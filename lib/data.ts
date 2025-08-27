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
  },
  {
    id: 3,
    name: 'Classic Leather Boots',
    price: 4500,
    originalPrice: 6000,
    rating: 4.7,
    reviews: 75,
    images: [
      'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg'
    ],
    category: 'Footwear',
    condition: 'New',
    size: '42',
    brand: 'Timberland',
    color: 'Brown',
    material: 'Leather',
    gender: 'unisex',
    description: 'Durable and stylish leather boots perfect for outdoor adventures.',
    trader: {
      id: 'trader-3',
      name: 'Outdoor Gear',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.6,
      totalSales: 300,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-02-10'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 2,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 300
    },
    features: [
      'Waterproof',
      'Comfortable fit',
      'Stylish design'
    ],
    specifications: {
      'Size': '42',
      'Material': 'Leather',
      'Condition': 'New',
      'Care': 'Wipe clean with a damp cloth'
    }
  },
  {
    id: 4,
    name: 'Stylish Sunglasses',
    price: 1500,
    originalPrice: 2500,
    rating: 4.8,
    reviews: 50,
    images: [
      'https://images.pexels.com/photos/2345678/pexels-photo-2345678.jpeg'
    ],
    category: 'Accessories',
    condition: 'New',
    size: 'One Size',
    brand: 'Ray-Ban',
    color: 'Black',
    material: 'Plastic',
    gender: 'unisex',
    description: 'Trendy sunglasses that provide UV protection and style.',
    trader: {
      id: 'trader-4',
      name: 'Fashion Accessories',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.9,
      totalSales: 150,
      responseTime: '< 2 hours',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-03-15'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 5,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 150
    },
    features: [
      'UV protection',
      'Lightweight design',
      'Stylish look'
    ],
    specifications: {
      'Condition': 'New',
      'Care': 'Store in a case when not in use'
    }
  },
  {
    id: 5,
    name: 'Casual Sneakers',
    price: 3000,
    originalPrice: 4000,
    rating: 4.5,
    reviews: 60,
    images: [
      'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg'
    ],
    category: 'Footwear',
    condition: 'New',
    size: '40',
    brand: 'Nike',
    color: 'White',
    material: 'Mesh',
    gender: 'unisex',
    description: 'Comfortable and stylish sneakers for everyday wear.',
    trader: {
      id: 'trader-5',
      name: 'Sneaker Store',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.7,
      totalSales: 200,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-04-01'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 3,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 250
    },
    features: [
      'Breathable material',
      'Lightweight design',
      'Versatile style'
    ],
    specifications: {
      'Size': '40',
      'Material': 'Mesh',
      'Condition': 'New',
      'Care': 'Wipe clean with a damp cloth'
    }
  },
  {
    id: 6,
    name: 'Elegant Evening Dress',
    price: 5000,
    originalPrice: 7000,
    rating: 4.9,
    reviews: 45,
    images: [
      'https://images.pexels.com/photos/3456789/pexels-photo-3456789.jpeg'
    ],
    category: 'Dresses',
    condition: 'Like New',
    size: 'S',
    brand: 'Zara',
    color: 'Black',
    material: 'Silk',
    gender: 'female',
    description: 'Elegant evening dress perfect for special occasions.',
    trader: {
      id: 'trader-6',
      name: 'Elegant Attire',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.8,
      totalSales: 180,
      responseTime: '< 2 hours',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-05-10'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 1,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 300
    },
    features: [
      'Elegant design',
      'Comfortable fit',
      'Perfect for special occasions'
    ],
    specifications: {
      'Size': 'Small (S)',
      'Material': 'Silk',
      'Condition': 'Like New',
      'Care': 'Dry clean only'
    }
  },
  {
    id: 7,
    name: 'Smart Watch',
    price: 6000,
    originalPrice: 8000,
    rating: 4.6,
    reviews: 70,
    images: [
      'https://images.pexels.com/photos/4567890/pexels-photo-4567890.jpeg'
    ],
    category: 'Electronics',
    condition: 'New',
    size: 'One Size',
    brand: 'Samsung',
    color: 'Black',
    material: 'Metal',
    gender: 'unisex',
    description: 'Feature-rich smartwatch with health monitoring capabilities.',
    trader: {
      id: 'trader-7',
      name: 'Tech Gadgets',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.7,
      totalSales: 250,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-06-15'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 4,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 200
    },
    features: [
      'Health monitoring',
      'Long battery life',
      'Water resistant'
    ],
    specifications: {
      'Condition': 'New',
      'Care': 'Avoid water exposure'
    }
  },
  {
    id: 8,
    name: 'Leather Wallet',
    price: 1200,
    originalPrice: 2000,
    rating: 4.4,
    reviews: 55,
    images: [
      'https://images.pexels.com/photos/5678901/pexels-photo-5678901.jpeg'
    ],
    category: 'Accessories',
    condition: 'New',
    size: 'One Size',
    brand: 'Fossil',
    color: 'Brown',
    material: 'Leather',
    gender: 'unisex',
    description: 'Durable leather wallet with multiple card slots.',
    trader: {
      id: 'trader-8',
      name: 'Leather Goods',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.5,
      totalSales: 120,
      responseTime: '< 2 hours',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-07-20'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 6,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 100
    },
    features: [
      'Multiple card slots',
      'Durable material',
      'Slim design'
    ],
    specifications: {
      'Condition': 'New',
      'Care': 'Wipe clean with a damp cloth'
    }
  },
  {
    id: 9,
    name: 'Running Shoes',
    price: 3500,
    originalPrice: 5000,
    rating: 4.7,
    reviews: 80,
    images: [
      'https://images.pexels.com/photos/6789012/pexels-photo-6789012.jpeg'
    ],
    category: 'Footwear',
    condition: 'New',
    size: '43',
    brand: 'Adidas',
    color: 'Blue',
    material: 'Mesh',
    gender: 'unisex',
    description: 'Comfortable running shoes for athletic activities.',
    trader: {
      id: 'trader-9',
      name: 'Sports Gear',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.6,
      totalSales: 220,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-08-25'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 3,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 250
    },
    features: [
      'Breathable material',
      'Comfortable fit',
      'Ideal for running'
    ],
    specifications: {
      'Size': '43',
      'Material': 'Mesh',
      'Condition': 'New',
      'Care': 'Machine washable'
    }
  },
  {
    id: 10,
    name: 'Winter Coat',
    price: 4000,
    originalPrice: 6000,
    rating: 4.8,
    reviews: 65,
    images: [
      'https://images.pexels.com/photos/7890123/pexels-photo-7890123.jpeg'
    ],
    category: 'Outerwear',
    condition: 'Excellent',
    size: 'L',
    brand: 'North Face',
    color: 'Green',
    material: 'Polyester',
    gender: 'unisex',
    description: 'Warm winter coat for cold weather.',
    trader: {
      id: 'trader-10',
      name: 'Outdoor Apparel',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.7,
      totalSales: 190,
      responseTime: '< 2 hours',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-09-30'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 2,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 300
    },
    features: [
      'Warm insulation',
      'Water resistant',
      'Durable material'
    ],
    specifications: {
      'Size': 'Large (L)',
      'Material': 'Polyester',
      'Condition': 'Excellent',
      'Care': 'Machine wash cold'
    }
  },
  {
    id: 11,
    name: 'Backpack',
    price: 2000,
    originalPrice: 3000,
    rating: 4.5,
    reviews: 50,
    images: [
      'https://images.pexels.com/photos/8901234/pexels-photo-8901234.jpeg'
    ],
    category: 'Bags',
    condition: 'New',
    size: 'Medium',
    brand: 'JanSport',
    color: 'Black',
    material: 'Nylon',
    gender: 'unisex',
    description: 'Durable backpack for everyday use.',
    trader: {
      id: 'trader-11',
      name: 'Bag Store',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.6,
      totalSales: 160,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-10-05'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 4,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 200
    },
    features: [
      'Multiple compartments',
      'Durable material',
      'Comfortable straps'
    ],
    specifications: {
      'Size': 'Medium',
      'Material': 'Nylon',
      'Condition': 'New',
      'Care': 'Wipe clean'
    }
  },
  {
    id: 12,
    name: 'Formal Shirt',
    price: 1500,
    originalPrice: 2500,
    rating: 4.3,
    reviews: 40,
    images: [
      'https://images.pexels.com/photos/9012345/pexels-photo-9012345.jpeg'
    ],
    category: 'Shirts',
    condition: 'New',
    size: 'M',
    brand: 'H&M',
    color: 'White',
    material: 'Cotton',
    gender: 'male',
    description: 'Classic formal shirt for professional settings.',
    trader: {
      id: 'trader-12',
      name: 'Formal Wear',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.4,
      totalSales: 130,
      responseTime: '< 2 hours',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-11-10'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 5,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 150
    },
    features: [
      'Classic design',
      'Comfortable fit',
      'Professional look'
    ],
    specifications: {
      'Size': 'Medium (M)',
      'Material': 'Cotton',
      'Condition': 'New',
      'Care': 'Machine wash cold'
    }
  },
  {
    id: 13,
    name: 'Sports Cap',
    price: 800,
    originalPrice: 1200,
    rating: 4.2,
    reviews: 35,
    images: [
      'https://images.pexels.com/photos/0123456/pexels-photo-0123456.jpeg'
    ],
    category: 'Accessories',
    condition: 'New',
    size: 'One Size',
    brand: 'Nike',
    color: 'Black',
    material: 'Polyester',
    gender: 'unisex',
    description: 'Comfortable sports cap for outdoor activities.',
    trader: {
      id: 'trader-13',
      name: 'Sports Accessories',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.3,
      totalSales: 110,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2023-12-15'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 7,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 100
    },
    features: [
      'Adjustable strap',
      'Breathable material',
      'UV protection'
    ],
    specifications: {
      'Condition': 'New',
      'Care': 'Hand wash'
    }
  },
  {
    id: 14,
    name: 'Jeans',
    price: 1800,
    originalPrice: 2800,
    rating: 4.6,
    reviews: 75,
    images: [
      'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg'
    ],
    category: 'Pants',
    condition: 'New',
    size: '32',
    brand: 'Levi\'s',
    color: 'Blue',
    material: 'Denim',
    gender: 'male',
    description: 'Classic jeans for casual wear.',
    trader: {
      id: 'trader-14',
      name: 'Denim Store',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.5,
      totalSales: 170,
      responseTime: '< 2 hours',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2024-01-20'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 4,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 200
    },
    features: [
      'Classic fit',
      'Durable material',
      'Versatile style'
    ],
    specifications: {
      'Size': '32',
      'Material': 'Denim',
      'Condition': 'New',
      'Care': 'Machine wash cold'
    }
  },
  {
    id: 15,
    name: 'Smartphone Case',
    price: 500,
    originalPrice: 800,
    rating: 4.1,
    reviews: 30,
    images: [
      'https://images.pexels.com/photos/2345678/pexels-photo-2345678.jpeg'
    ],
    category: 'Accessories',
    condition: 'New',
    size: 'One Size',
    brand: 'Spigen',
    color: 'Black',
    material: 'Silicone',
    gender: 'unisex',
    description: 'Protective case for smartphones.',
    trader: {
      id: 'trader-15',
      name: 'Phone Accessories',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg',
      rating: 4.2,
      totalSales: 90,
      responseTime: '< 1 hour',
      location: 'Nairobi',
      verified: true,
      joinedDate: '2024-02-25'
    },
    location: 'Nairobi',
    availability: 'In Stock',
    quantity: 10,
    shipping: {
      sameDay: true,
      nextDay: true,
      standard: true,
      cost: 50
    },
    features: [
      'Shock absorption',
      'Slim design',
      'Easy access to ports'
    ],
    specifications: {
      'Condition': 'New',
      'Care': 'Wipe clean'
    }
  }
];
