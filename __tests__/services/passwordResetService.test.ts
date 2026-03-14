import { passwordResetService } from '@/lib/password-reset-service';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    passwordResetToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  },
}));

jest.mock('@/lib/notifications', () => ({
  notifyPasswordReset: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('passwordResetService', () => {
  describe('generateResetToken', () => {
    it('should create token and send email if user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'u1', email: 'test@test.com' });
      
      await passwordResetService.generateResetToken('test@test.com');

      expect(prisma.passwordResetToken.create).toHaveBeenCalled();
    });

    it('should do nothing but return true if user does not exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      const result = await passwordResetService.generateResetToken('fake@test.com');

      expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset password if token is valid', async () => {
      const token = 'valid-token';
      const newPassword = 'new-password';
      const tokenData = {
        userId: 'u1',
        expiresAt: new Date(Date.now() + 10000),
        usedAt: null,
      };

      (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(tokenData);

      await passwordResetService.resetPassword(token, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { password: 'hashed_password' },
      });
      expect(prisma.passwordResetToken.update).toHaveBeenCalledWith({
        where: { token },
        data: { usedAt: expect.any(Date) },
      });
    });
  });
});
