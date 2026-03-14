"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

type AuthContextType = {
  session: any | null;
  user: any | null;
  profile: any | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
});

// Internal provider that connects NextAuth session to our AuthContext
const AuthStateManager = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const loading = status === 'loading';

  useEffect(() => {
    if (session?.user) {
      const userData = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image,
        isVerified: session.user.isVerified,
      };
      setUser(userData);
      
      // Profile is essentially the user in our new Prisma-backed Auth.js setup
      setProfile({
        ...userData,
        full_name: session.user.name,
        avatar_url: session.user.image,
        phone: (session.user as any).phone,
        location: (session.user as any).location,
        is_verified: session.user.isVerified,
      });
    } else {
      setUser(null);
      setProfile(null);
    }
  }, [session, status]);

  const value = {
    session,
    user,
    profile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AuthStateManager>
        {children}
      </AuthStateManager>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
