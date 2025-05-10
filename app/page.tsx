'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/auth-client';

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard
    if (session) {
      router.push('/dashboard');
      return;
    }

    // If not logged in, redirect to sign in
    router.push('/auth/signin');
  }, [router, session]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="animate-pulse text-white text-2xl">Loading...</div>
    </div>
  );
}
