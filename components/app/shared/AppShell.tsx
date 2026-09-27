'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/app/shared/Navbar';
import Sidebar from '@/components/app/shared/Sidebar';
import { isPublicPath } from '@/components/app/shared/navigation';
import { useSession } from '@/lib/auth/auth-client';

const SESSION_CHECK_TIMEOUT_MS = 10_000;

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
  const [sessionCheckTimedOut, setSessionCheckTimedOut] = useState(false);

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

  useEffect(() => {
    if (isPublicRoute || !isPending) {
      setSessionCheckTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(
      () => setSessionCheckTimedOut(true),
      SESSION_CHECK_TIMEOUT_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, [isPending, isPublicRoute]);

  if (!isPublicRoute && (!authCheckReady || isPending || logoutRequested || !session)) {
    if (sessionCheckTimedOut) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] p-6">
          <div className="max-w-sm text-center">
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">We couldn’t verify your session.</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Check your connection and try again.
            </p>
            <button type="button" className="app-button mt-5" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </main>
      );
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] p-6">
        <div className="text-sm text-[var(--text-secondary)]" role="status">
          Checking your session…
        </div>
      </main>
    );
  }

  return (
    <div className="app-shell flex min-h-screen">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {!isPublicRoute && <Sidebar />}
      <main
        id="main-content"
        tabIndex={-1}
        className={`shell-main ${
          isPublicRoute
            ? ''
            : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pb-8 lg:pt-8'
        }`}
      >
        {children}
      </main>
      {!isPublicRoute && <Navbar />}
    </div>
  );
}
