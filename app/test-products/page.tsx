"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        
        console.log('Attempting to fetch products from database...');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(10);
          
        if (error) {
          console.error('Supabase error:', error);
          setError(`Database error: ${error.message}`);
        } else {
          console.log('Products fetched successfully:', data);
          setProducts(data || []);
        }
      } catch (err) {
        console.error('General error:', err);
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-4">Loading products...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Products</h1>
      <p>Found {products.length} products</p>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id} className="mb-2 p-2 border rounded">
              <strong>{product.name}</strong> - KSh {product.price}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products found in database</p>
      )}
    </div>
  );
}