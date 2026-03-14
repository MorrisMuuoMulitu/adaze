import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

/**
 * Vercel KV Rate Limiter
 *
 * Prevents abuse of AI and Payment endpoints.
 */

export async function rateLimit(identifier: string, limit: number = 5, duration: number = 60) {
  const key = `ratelimit:${identifier}`
  const current = await kv.incr(key)

  if (current === 1) {
    await kv.expire(key, duration)
  }

  if (current > limit) {
    return { success: false, current, limit }
  }

  return { success: true, current, limit }
}

export function rateLimitResponse(info: { current: number; limit: number }) {
  return new NextResponse('Too Many Requests', {
    status: 429,
    headers: {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': '0',
    },
  })
}

/**
 * Specialized Rate Limiters
 *
 * Pre-configured rate limiters for specific use cases.
 */

/**
 * Login rate limiter: 5 attempts per 15 minutes per IP
 * Prevents brute force login attacks
 */
export async function loginRateLimit(ip: string) {
  return rateLimit(`login:${ip}`, 5, 900) // 5 requests per 15 minutes
}

/**
 * Registration rate limiter: 3 registrations per hour per IP
 * Prevents mass account creation
 */
export async function registerRateLimit(ip: string) {
  return rateLimit(`register:${ip}`, 3, 3600) // 3 requests per hour
}

/**
 * M-Pesa callback rate limiter: 10 callbacks per minute per order
 * Prevents duplicate payment processing
 */
export async function mpesaCallbackRateLimit(orderId: string) {
  return rateLimit(`mpesa:${orderId}`, 10, 60) // 10 requests per minute
}

/**
 * Password reset rate limiter: 3 requests per hour per email
 * Prevents email flooding
 */
export async function passwordResetRateLimit(email: string) {
  return rateLimit(`password-reset:${email}`, 3, 3600) // 3 requests per hour
}

/**
 * API rate limiter: 100 requests per minute per user/IP
 * General purpose API protection
 */
export async function apiRateLimit(identifier: string) {
  return rateLimit(`api:${identifier}`, 100, 60) // 100 requests per minute
}

/**
 * Search rate limiter: 30 searches per minute per IP
 * Prevents search abuse
 */
export async function searchRateLimit(ip: string) {
  return rateLimit(`search:${ip}`, 30, 60) // 30 searches per minute
}

/**
 * Review submission rate limiter: 10 reviews per hour per user
 * Prevents review spam
 */
export async function reviewRateLimit(userId: string) {
  return rateLimit(`review:${userId}`, 10, 3600) // 10 reviews per hour
}

/**
 * Chat message rate limiter: 30 messages per minute per user
 * Prevents chat spam
 */
export async function chatRateLimit(userId: string) {
  return rateLimit(`chat:${userId}`, 30, 60) // 30 messages per minute
}
