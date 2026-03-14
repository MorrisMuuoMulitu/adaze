import { Role, User } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: Role;
    isVerified: boolean;
    email: string | null;
    name: string | null;
    image: string | null;
    password: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      isVerified: boolean;
      email: string | null;
      name: string | null;
      image: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
  }
}
