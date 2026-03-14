import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { socialProofService } from "@/lib/social-proof-service";

export const dynamic = 'force-dynamic';

/**
 * POST /api/products/[id]/view
 * Track a product view
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const productId = params.id;
    
    // We track views even for non-logged in users via session if possible
    // For now, just pass userId if available
    await socialProofService.trackView(productId, session?.user?.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API/Products/View] Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/**
 * GET /api/products/[id]/view
 * Get social proof data for a product
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const data = await socialProofService.getProductSocialProof(productId);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API/Products/SocialProof] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch social proof data" },
      { status: 500 }
    );
  }
}
