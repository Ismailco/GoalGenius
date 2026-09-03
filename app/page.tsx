'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogoMark from '@/components/app/shared/AppLogoMark';
import { useSession } from '@/lib/auth/auth-client';

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (session) {
      router.replace('/dashboard');
      return;
    }

    router.replace('/auth/signin');
  }, [isPending, router, session]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="surface-panel max-w-md p-10 text-center">
        <AppLogoMark className="mx-auto mb-4" />
        <p className="page-kicker">Redirecting</p>
        <h1 className="text-2xl font-semibold text-white">Opening your workspace</h1>
        <p className="mt-3 animate-pulse text-sm text-[var(--text-secondary)]">
          Loading...
        </p>
      </div>
    </div>
  );
}
