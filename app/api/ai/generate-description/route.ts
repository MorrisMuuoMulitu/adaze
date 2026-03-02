import { Configuration, OpenAIApi } from 'openai-edge'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export const runtime = 'edge'

export async function POST(req: Request) {
  // Rate Limit: 10 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
  const rl = await rateLimit(`ai:${ip}`, 10, 60)
  
  if (!rl.success) {
    return rateLimitResponse(rl)
  }

  const { prompt } = await req.json()

  try {
    const response = await openai.createChatCompletion({
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

    // Return the raw response which is already a stream in edge runtime
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
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
