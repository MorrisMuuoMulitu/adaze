import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatService } from "@/lib/chat-service";
import { chatRateLimit } from "@/lib/rate-limit";
import { extractClientIP } from "@/lib/ip-utils";

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/conversations
 * List all conversations for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const conversations = await chatService.getUserConversations(session.user.id);
    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("[API/Chat/Conversations] GET Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/conversations
 * Create or get a conversation
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await chatRateLimit(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    const { traderId, productId, orderId } = await request.json();

    if (!traderId) {
      return NextResponse.json({ message: "Trader ID is required" }, { status: 400 });
    }

    const conversation = await chatService.getOrCreateConversation(
      session.user.id,
      traderId,
      productId,
      orderId
    );

    return NextResponse.json(conversation);
  } catch (error: any) {
    console.error("[API/Chat/Conversations] POST Error:", error);
    return NextResponse.json(
      { message: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
