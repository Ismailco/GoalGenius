'use client';

import { createContext, useContext, useEffect } from 'react';
import { useSession } from '@/lib/auth/auth-client';

// Create a context to hold the session
const StorageContext = createContext<{ userId: string | null }>({ userId: null });

// Create a hook to access the storage context
export const useStorage = () => useContext(StorageContext);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Update localStorage whenever session changes
  useEffect(() => {
    if (session?.user?.id) {
      localStorage.setItem('userId', session.user.id);
    }
  }, [session]);

  return (
    <StorageContext.Provider value={{ userId: session?.user?.id || null }}>
      {children}
    </StorageContext.Provider>
  );
}
