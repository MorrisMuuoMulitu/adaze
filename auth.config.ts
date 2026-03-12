import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Added later in auth.ts
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard') || 
                          nextUrl.pathname.startsWith('/admin') ||
                          nextUrl.pathname.startsWith('/profile') ||
                          nextUrl.pathname.startsWith('/cart') ||
                          nextUrl.pathname.startsWith('/checkout') ||
                          nextUrl.pathname.startsWith('/orders') ||
                          nextUrl.pathname.startsWith('/wishlist') ||
                          nextUrl.pathname.startsWith('/transporter');
      
      if (isDashboardRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.phone = (user as any).phone;
        token.location = (user as any).location;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as any;
        session.user.id = token.id as string;
        (session.user as any).phone = token.phone;
        (session.user as any).location = token.location;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
