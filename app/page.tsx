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
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface-panel max-w-md p-10 text-center">
        <div className="mx-auto mb-4 brand-mark">G</div>
        <p className="page-kicker">Redirecting</p>
        <h1 className="text-2xl font-semibold text-white">Opening your workspace</h1>
        <p className="mt-3 animate-pulse text-sm text-[var(--text-secondary)]">
          Loading...
        </p>
      </div>
    </div>
  );
}
