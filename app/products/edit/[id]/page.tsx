
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { productService, Product } from '@/lib/productService';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const productSchema = z.object({
  name: z.string().min(1, { message: "Product name is required" }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
  category: z.string().optional(),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  stock_quantity: z.coerce.number().int().min(0, { message: "Stock must be a positive integer" }),
});

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      image_url: "",
      stock_quantity: 0,
    },
  });

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id as string);

        if (!data) {
          toast.error("Product not found");
          router.push('/dashboard/trader');
          return;
        }
        
        setProduct(data);
        form.reset({
          name: data.name,
          description: data.description || "",
          price: data.price,
          category: data.category || "",
          image_url: data.image_url || "",
          stock_quantity: data.stock_quantity,
        });
      } catch (error: any) {
        toast.error("Failed to fetch product", { description: error.message });
        router.push('/dashboard/trader');
      }
    };

    fetchProduct();
  }, [id, router, form]);

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (!user || !id) {
      toast.error("Error updating product.");
      return;
    }

    setLoading(true);
    try {
      await productService.updateProduct(id as string, {
        name: values.name,
        description: values.description || null,
        price: values.price,
        category: values.category || null,
        image_url: values.image_url || null,
        stock_quantity: values.stock_quantity,
      });

      toast.success("Product updated successfully!");
      router.push('/dashboard/trader');
    } catch (error: any) {
      toast.error("Failed to update product", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link href="/products/manage">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KSh)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => router.push('/products/manage')} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating Product...' : 'Update Product'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
