'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={true}
      refetchInterval={5 * 60} // Обновлять сессию каждые 5 минут
    >
      {children}
    </NextAuthSessionProvider>
  );
}
