import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth/auth-client';

/**
 * Custom hook to fetch and manage the user's role
 * @returns An object containing the user role and loading state
 */
export function useUserRole() {
  const { data: session } = useSession();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset state if no session exists
    if (!session) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // Fetch user role when session is available
    const fetchRole = async () => {
      try {
        setIsLoading(true);

        // Fetch the role from our API endpoint
        const response = await fetch('/api/user/role');

        if (!response.ok) {
          throw new Error('Failed to fetch user role');
        }

        const data = await response.json() as { role: string };
        setRole(data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Default to client role if there's an error
        setRole('client');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [session]);

  return { role, isLoading };
}
