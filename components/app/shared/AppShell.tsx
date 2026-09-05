'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/app/shared/Navbar';
import Sidebar from '@/components/app/shared/Sidebar';
import { isPublicPath } from '@/components/app/shared/navigation';
import { useSession } from '@/lib/auth/auth-client';

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isPublicRoute = isPublicPath(pathname);
  const { data: session, isPending } = useSession();
  const [authCheckReady, setAuthCheckReady] = useState(false);
  const [logoutRequested, setLogoutRequested] = useState(false);

  useEffect(() => {
    if (isPublicRoute) {
      setAuthCheckReady(true);
      return;
    }

    if (sessionStorage.getItem('goalgenius-logged-out') === 'true') {
      setLogoutRequested(true);
      window.location.replace(
        `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`,
      );
      return;
    }

    setAuthCheckReady(true);
  }, [isPublicRoute, pathname]);

  useEffect(() => {
    if (isPublicRoute || isPending || session || logoutRequested) return;

    window.location.replace(
      `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`,
    );
  }, [isPending, isPublicRoute, logoutRequested, pathname, session]);

  if (!isPublicRoute && (!authCheckReady || isPending || logoutRequested || !session)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
        <div className="text-sm text-[var(--text-secondary)]" role="status">
          Checking your session…
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell flex min-h-screen">
      {!isPublicRoute && <Sidebar />}
      <main
        className={`shell-main ${
          isPublicRoute ? '' : 'pb-28 pt-24 md:pb-8 md:pt-8'
        }`}
      >
        {children}
      </main>
      {!isPublicRoute && <Navbar />}
    </div>
  );
}
