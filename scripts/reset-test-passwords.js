const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPasswords() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const users = [
    'admin@adaze.com',
    'john.doe@example.com'
  ];

  for (const email of users) {
    try {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log(`Password reset successfully for ${email}`);
    } catch (error) {
      console.error(`Failed to reset password for ${email}:`, error.message);
    }
  }

  await prisma.$disconnect();
}

resetPasswords();
