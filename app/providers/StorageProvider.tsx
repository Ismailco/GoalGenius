'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth/auth-client';
import { clearUserCache } from '@/lib/storage';

// Create a context to hold the session
const StorageContext = createContext<{ userId: string | null }>({ userId: null });

// Create a hook to access the storage context
export const useStorage = () => useContext(StorageContext);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const previousUserIdRef = useRef<string | null>(null);

  // Update localStorage whenever session changes
  useEffect(() => {
    const currentUserId = session?.user?.id || null;
    const storedUserId = localStorage.getItem('userId');
    const previousUserId = previousUserIdRef.current;

    if (storedUserId && currentUserId && storedUserId !== currentUserId) {
      clearUserCache(storedUserId);
    }

    if (previousUserId && previousUserId !== currentUserId) {
      clearUserCache(previousUserId);
    }

    if (!currentUserId) {
      if (storedUserId) {
        clearUserCache(storedUserId);
      }
      localStorage.removeItem('userId');
      previousUserIdRef.current = null;
      return;
    }

    localStorage.setItem('userId', currentUserId);
    previousUserIdRef.current = currentUserId;
  }, [session]);

  return (
    <StorageContext.Provider value={{ userId: session?.user?.id || null }}>
      {children}
    </StorageContext.Provider>
  );
}
