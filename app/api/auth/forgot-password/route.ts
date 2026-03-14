import { NextResponse } from "next/server";
import { passwordResetService } from "@/lib/password-reset-service";
import { passwordResetRateLimit } from "@/lib/rate-limit";
import { extractClientIP } from "@/lib/ip-utils";

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/forgot-password
 * Initiate password reset flow
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await passwordResetRateLimit(email);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    await passwordResetService.generateResetToken(email);

    return NextResponse.json({
      message: "If an account exists with that email, we've sent a password reset link.",
    });
  } catch (error: any) {
    console.error("[API/Auth/ForgotPassword] Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
