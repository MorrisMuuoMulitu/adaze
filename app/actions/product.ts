'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Invalid image URL').optional(),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
  traderId: z.string().uuid('Invalid Trader ID'),
})

export async function createProduct(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    price: Number(formData.get('price')),
    category: formData.get('category'),
    stockQuantity: Number(formData.get('stockQuantity')),
    traderId: formData.get('traderId'), // In real app, get from session
  }

  // Handle file upload if present
  let imageUrl = formData.get('imageUrl') as string;
  const imageFile = formData.get('imageFile') as File;

  if (imageFile && imageFile.size > 0) {
    const blob = await put(imageFile.name, imageFile, {
      access: 'public',
    });
    imageUrl = blob.url;
  }

  const result = productSchema.safeParse({ ...rawData, imageUrl })

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors }
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        category: result.data.category,
        imageUrl: result.data.imageUrl,
        stockQuantity: result.data.stockQuantity,
        traderId: result.data.traderId,
      },
    })

    revalidatePath('/products')
    return { success: true, product }
  } catch (error) {
    console.error('Failed to create product:', error)
    return { error: 'Failed to create product in database' }
  }
}
