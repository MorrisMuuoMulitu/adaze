import { kv } from '@vercel/kv'

const CART_EXPIRY = 60 * 60 * 24 * 7 // 7 days in seconds

/**
 * Vercel KV for Real-time Cart State
 * 
 * Strategy:
 * - High-speed reads/writes for adding/removing items in session (KV).
 * - Background persistence to Neon (Postgres) on checkout or significant changes.
 * - KV is the source of truth for the "alive" cart in the browser.
 */

export interface CartItemKV {
  productId: string
  quantity: number
  name: string
  price: number
  image?: string
}

export async function getCartKV(userId: string): Promise<CartItemKV[]> {
  const cart = await kv.get<CartItemKV[]>(`cart:${userId}`)
  return cart || []
}

export async function addToCartKV(userId: string, item: CartItemKV) {
  const currentCart = await getCartKV(userId)
  const existingItemIndex = currentCart.findIndex(i => i.productId === item.productId)

  if (existingItemIndex > -1) {
    currentCart[existingItemIndex].quantity += item.quantity
  } else {
    currentCart.push(item)
  }

  await kv.set(`cart:${userId}`, currentCart, { ex: CART_EXPIRY })
  return currentCart
}

export async function removeFromCartKV(userId: string, productId: string) {
  const currentCart = await getCartKV(userId)
  const newCart = currentCart.filter(i => i.productId !== productId)
  
  await kv.set(`cart:${userId}`, newCart, { ex: CART_EXPIRY })
  return newCart
}

export async function clearCartKV(userId: string) {
  await kv.del(`cart:${userId}`)
}

/**
 * Sync KV cart to Neon database (background process)
 */
export async function syncCartToNeon(userId: string) {
  const cart = await getCartKV(userId)
  
  if (cart.length === 0) return

  const { prisma } = await import('@/lib/prisma')

  // Using Prisma transaction for atomicity
  await prisma.$transaction(async (tx) => {
    // 1. Clear current database cart for user
    await tx.cartItem.deleteMany({ where: { userId } })

    // 2. Insert new items from KV
    await tx.cartItem.createMany({
      data: cart.map(item => ({
        userId,
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
  })
}
