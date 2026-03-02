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

export function rateLimitResponse(info: { current: number, limit: number }) {
  return new NextResponse('Too Many Requests', {
    status: 429,
    headers: {
      'X-RateLimit-Limit': info.limit.toString(),
      'X-RateLimit-Remaining': '0',
    },
  })
}
