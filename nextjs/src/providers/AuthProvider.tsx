'use client';

import { User } from '@/types';
import { createContext, useContext } from 'react';

type Session = {
  user: User;
  accessToken: string;
};

const AuthContext = createContext<Session | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function AuthProvider({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}
