import { NextResponse } from "next/server";
import { priceAlertService } from "@/lib/price-alert-service";

/**
 * GET /api/cron/price-check
 * Vercel Cron Job to check for price drops
 * To be called periodically (e.g., daily)
 */
export async function GET(request: Request) {
  // Security check: Only allow Vercel Cron or manual calls with CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    request.headers.get("x-vercel-cron") !== "1"
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const notificationsSent = await priceAlertService.checkPriceDrops();
    
    return NextResponse.json({
      success: true,
      notificationsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON/PriceCheck] Error:", error);
    return NextResponse.json(
      { message: "Failed to run price check" },
      { status: 500 }
    );
  }
}
