'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Upload } from 'lucide-react'
import { createProduct } from '@/app/actions/product'
import { useToast } from '@/hooks/use-toast'

const productSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  image: z.instanceof(File).optional(),
})

type FormData = z.infer<typeof productSchema>

export function ProductUpload() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(productSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('price', data.price.toString())
    formData.append('category', data.category)
    formData.append('stockQuantity', data.stockQuantity.toString())
    if (data.image) {
      formData.append('imageFile', data.image)
    }
    // Hardcoded traderId for demo purposes, replace with auth session ID
    formData.append('traderId', 'user_123') 

    try {
      const result = await createProduct(formData)
      if (result.error) {
        console.error(result.error)
        toast({
          title: "Submission Failed",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success!",
          description: "Product uploaded successfully.",
        })
        // Reset form or redirect
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-md bg-white/80 border border-white/20 shadow-xl rounded-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          List New Item
        </CardTitle>
        <CardDescription>
          Share your pre-loved fashion with the community.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g. Vintage Denim Jacket" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" {...register('category')} placeholder="e.g. Outerwear" />
              {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (KES)</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} placeholder="0.00" />
              {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the condition, size, and style..."
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input id="stock" type="number" {...register('stockQuantity')} defaultValue={1} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <input 
                id="image" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setValue('image', file)
                }} 
              />
              <label htmlFor="image" className="cursor-pointer text-sm text-gray-500 font-medium">
                Click to upload image
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Listing Item...
              </>
            ) : (
              'List Item'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
