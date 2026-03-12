import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user as any;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log('🔐 Auth: Initiating credentials verification...');
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          
          if (!user || !user.password) {
            console.warn('🔐 Auth: User not found or missing password record');
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
             console.log('🔐 Auth: Verification Successful for:', email);
             return user;
          }
           console.warn('🔐 Auth: Invalid password for:', email);
        } else {
           console.error('🔐 Auth: Schema validation failed for credentials');
        }

        return null;
      },
    }),
  ],
});
