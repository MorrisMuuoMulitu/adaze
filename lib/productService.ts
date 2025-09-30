import { createClient } from '@/lib/supabase/client';
import { ErrorHandler } from '@/lib/errorHandler';

export interface Product {
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

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  traderId?: string;
}

class ProductService {
  private supabase = createClient();

  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = this.supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters) {
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        
        if (filters.minPrice !== undefined) {
          query = query.gte('price', filters.minPrice);
        }
        
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice);
        }
        
        if (filters.search) {
          query = query.ilike('name', `%${filters.search}%`);
        }
        
        if (filters.traderId) {
          query = query.eq('trader_id', filters.traderId);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ProductService.getAllProducts');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if ((error as any).code === 'PGRST116') {
          // Record not found
          return null;
        } else {
          throw error;
        }
      }

      return data as Product;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ProductService.getProductById');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'rating'>): Promise<Product | null> {
    try {
      const productWithDefaults = {
        ...productData,
        rating: 0.0  // Default rating
      };

      const { data, error } = await this.supabase
        .from('products')
        .insert([productWithDefaults])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Product;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ProductService.createProduct');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      // Don't allow updating id, created_at
      const { id: _, created_at: __, updated_at: ___, rating: ____, ...updateData } = productData as any;
      
      const { data, error } = await this.supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Product;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ProductService.updateProduct');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ProductService.deleteProduct');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }

  async getProductsByTrader(traderId: string): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase
        .from('products')
        .select('*')
        .eq('trader_id', traderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error) {
      const appError = ErrorHandler.handle(error, 'ProductService.getProductsByTrader');
      ErrorHandler.showErrorToast(appError);
      throw error;
    }
  }
}

export const productService = new ProductService();