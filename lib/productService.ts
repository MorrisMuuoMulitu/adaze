export interface Product {
  id: string;
  trader_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  stock_quantity: number;
  rating: number;
  review_count?: number;
  created_at: string | Date;
  updated_at: string | Date;
  // Optional relations
  trader?: {
    id: string;
    name: string | null;
    location: string | null;
    image: string | null;
  };
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  traderId?: string;
}

class ProductService {
  private isServer = typeof window === 'undefined';

  private mapPrismaToProduct(p: any): Product {
    return {
      id: p.id,
      trader_id: p.traderId,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      category: p.category,
      image_url: p.imageUrl,
      stock_quantity: p.stockQuantity,
      rating: Number(p.rating),
      created_at: p.createdAt,
      updated_at: p.updatedAt,
      trader: p.trader ? {
        id: p.trader.id,
        name: p.trader.name,
        location: p.trader.location,
        image: p.trader.image,
      } : undefined
    };
  }

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    if (!this.isServer) {
      const url = new URL('/api/products', window.location.origin);
      if (filters) {
        if (filters.category) url.searchParams.set('category', filters.category);
        if (filters.minPrice) url.searchParams.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) url.searchParams.set('maxPrice', filters.maxPrice.toString());
        if (filters.search) url.searchParams.set('q', filters.search);
        if (filters.traderId) url.searchParams.set('traderId', filters.traderId);
      }
      const res = await fetch(url.toString());
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const where: any = {};
      
      if (filters) {
        if (filters.category) {
          where.category = filters.category;
        }
        
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
          where.price = {};
          if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
          if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
        }
        
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
        
        if (filters.traderId) {
          where.traderId = filters.traderId;
        }
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          trader: {
            select: { id: true, name: true, location: true, image: true }
          }
        }
      });

      return products.map(p => this.mapPrismaToProduct(p));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${id}`);
      if (res.status === 404) return null;
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          trader: {
            select: { id: true, name: true, location: true, image: true }
          }
        }
      });

      if (!product) return null;
      return this.mapPrismaToProduct(product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating'>): Promise<Product | null> {
    if (!this.isServer) {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const product = await prisma.product.create({
        data: {
          traderId: productData.trader_id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          imageUrl: productData.image_url,
          stockQuantity: productData.stock_quantity,
          rating: 0.0,
        },
      });

      return this.mapPrismaToProduct(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const updateData: any = {};
      if (productData.name) updateData.name = productData.name;
      if (productData.description) updateData.description = productData.description;
      if (productData.price) updateData.price = productData.price;
      if (productData.category) updateData.category = productData.category;
      if (productData.image_url) updateData.imageUrl = productData.image_url;
      if (productData.stock_quantity !== undefined) updateData.stockQuantity = productData.stock_quantity;

      const product = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      return this.mapPrismaToProduct(product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!this.isServer) {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      return data.success;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getProductsByTrader(traderId: string): Promise<Product[]> {
    if (!this.isServer) {
      const res = await fetch(`/api/products?traderId=${traderId}`);
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const products = await prisma.product.findMany({
        where: { traderId },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return products.map(p => this.mapPrismaToProduct(p));
    } catch (error) {
      console.error('Error fetching products by trader:', error);
      throw error;
    }
  }
}

export const productService = new ProductService();