import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { notifyPasswordReset } from "./notifications";

export const passwordResetService = {
  /**
   * Generate a password reset token for a user
   */
  async generateResetToken(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return true even if user doesn't exist to prevent email enumeration
      return true;
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send email notification
    await notifyPasswordReset(user.email!, token);

    return true;
  },

  /**
   * Validate a password reset token
   */
  async validateToken(token: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return { valid: false, message: "Invalid token" };
    }

    if (resetToken.usedAt) {
      return { valid: false, message: "Token has already been used" };
    }

    if (resetToken.expiresAt < new Date()) {
      return { valid: false, message: "Token has expired" };
    }

    return { valid: true, userId: resetToken.userId, user: resetToken.user };
  },

  /**
   * Reset user password using a token
   */
  async resetPassword(token: string, newPassword: string) {
    const validation = await this.validateToken(token);
    
    if (!validation.valid) {
      return validation;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: validation.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return { valid: true, message: "Password reset successful" };
  },
};
