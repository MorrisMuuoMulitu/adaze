
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added password field for authentication
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'buyer' | 'trader' | 'transporter';
  avatar?: string;
  location: string;
  isVerified: boolean;
  wallet: {
    balance: number;
    currency: string;
  };
  preferences: {
    notifications: boolean;
    language: 'en' | 'sw';
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  images: string[];
  category: string;
  condition: string;
  size: string;
  brand: string;
  color: string;
  material: string;
  gender: string;
  description: string;
  trader: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalSales: number;
    responseTime: string;
    location: string;
    verified: boolean;
    joinedDate: string;
  };
  location: string;
  availability: string;
  quantity: number;
  shipping: {
    sameDay: boolean;
    nextDay: boolean;
    standard: boolean;
    cost: number;
  };
  features: string[];
  specifications: {
    [key: string]: string;
  };
}
