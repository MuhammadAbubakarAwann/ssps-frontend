'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ToasterProvider } from '@/components/ui/toaster';

interface ProvidersProps {
  children: ReactNode;
  session?: any; // You can type this more specifically if needed
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <ToasterProvider />
      {children}
    </SessionProvider>
  );
}