import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatService } from "@/lib/chat-service";

export const dynamic = 'force-dynamic';

/**
 * POST /api/chat/conversations/[id]/read
 * Mark messages in a conversation as read
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

    await chatService.markAsRead(params.id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API/Chat/Read] POST Error:", error);
    return NextResponse.json(
      { message: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
