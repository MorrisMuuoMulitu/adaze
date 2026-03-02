import OpenAI from 'openai'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Rate Limit: 10 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  const rl = await rateLimit(`ai:${ip}`, 10, 60)
  
  if (!rl.success) {
    return rateLimitResponse(rl)
  }

  const { prompt } = await req.json()

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        {
          role: 'system',
          content: `You are an expert copywriter for an African second-hand fashion marketplace called Adaze. 
          Create a compelling, SEO-friendly product description based on the provided details. 
          Focus on authenticity, quality, and style. Keep it under 150 words.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Create a ReadableStream from the OpenAI stream
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const part of stream) {
          const content = part.choices[0]?.delta?.content || ''
          controller.enqueue(new TextEncoder().encode(content))
        }
        controller.close()
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('AI error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
