import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Rate Limit: 20 searches per minute per IP
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  const rl = await rateLimit(`search:${ip}`, 20, 60)
  
  if (!rl.success) {
    return rateLimitResponse(rl)
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) return Response.json({ results: [] })

  try {
    /**
     * Intelligent Search Logic:
     * 1. Use GPT-3.5 to extract structured keywords, categories, and potential intent from natural language.
     * 2. Query Neon (Prisma) with the expanded search criteria.
     * 3. Return results ranked by relevance.
     */
    
    const extractionResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a search query optimizer for an African fashion marketplace. 
          Extract relevant keywords, categories (e.g., shirts, dresses, shoes), 
          and stylistic preferences from the user's query.
          Respond in JSON format: { "keywords": [], "categories": [], "minPrice": null, "maxPrice": null }`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
    })

    const contentStr = extractionResponse.choices[0].message.content || '{}';
    const content = JSON.parse(contentStr)

    // Execute query with Neon (optimized with the @@index created in schema.prisma)
    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: content.keywords[0] || query, mode: 'insensitive' } },
          { category: { in: content.categories } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        AND: [
          content.minPrice ? { price: { gte: content.minPrice } } : {},
          content.maxPrice ? { price: { lte: content.maxPrice } } : {},
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    })

    return Response.json({ results, aiIntent: content })
  } catch (error) {
    console.error('AI Search Error:', error)
    // Fallback to basic search if AI fails
    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
    })
    return Response.json({ results, fallback: true })
  }
}
