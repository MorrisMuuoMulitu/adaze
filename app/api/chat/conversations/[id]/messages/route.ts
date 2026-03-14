import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatService } from "@/lib/chat-service";
import { chatRateLimit } from "@/lib/rate-limit";

export const dynamic = 'force-dynamic';

/**
 * GET /api/chat/conversations/[id]/messages
 * Get messages for a conversation
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const messages = await chatService.getConversationMessages(params.id);
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("[API/Chat/Messages] GET Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/conversations/[id]/messages
 * Send a message
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await chatRateLimit(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many messages. Please slow down." },
        { status: 429 }
      );
    }

    const { content, attachments } = await request.json();

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ message: "Message content is required" }, { status: 400 });
    }

    const message = await chatService.sendMessage(
      params.id,
      session.user.id,
      content,
      attachments
    );

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("[API/Chat/Messages] POST Error:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}
