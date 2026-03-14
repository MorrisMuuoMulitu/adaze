import { NextResponse } from "next/server";
import { passwordResetService } from "@/lib/password-reset-service";
import { extractClientIP } from "@/lib/ip-utils";

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const result = await passwordResetService.resetPassword(token, password);

    if (!result.valid) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Password reset successful. You can now log in." });
  } catch (error: any) {
    console.error("[API/Auth/ResetPassword] Error:", error);
    return NextResponse.json(
      { message: "An error occurred while resetting your password." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password
 * Validate token for UI
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }

    const validation = await passwordResetService.validateToken(token);

    if (!validation.valid) {
      return NextResponse.json({ message: validation.message, valid: false }, { status: 400 });
    }

    return NextResponse.json({ valid: true, email: validation.user?.email });
  } catch (error: any) {
    console.error("[API/Auth/ResetPassword/Validate] Error:", error);
    return NextResponse.json(
      { message: "An error occurred while validating the token." },
      { status: 500 }
    );
  }
}
