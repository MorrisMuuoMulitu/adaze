"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateOrderPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/'); // Redirect to home if not logged in
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6" />
                Orders Are Now Made Through Cart
              </CardTitle>
              <CardDescription>Shop products and add them to your cart to create orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="mx-auto bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Items to Cart First</h3>
                <p className="text-muted-foreground mb-6">
                  To create an order, browse products and add them to your cart.
                  Then proceed to checkout to create your order.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => router.push('/marketplace')}>
                    Browse Products
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/cart')}>
                    View Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}