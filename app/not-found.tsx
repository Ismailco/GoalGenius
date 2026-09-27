'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { CircleAlert } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  // Get the parent path for smart redirection
  const getParentPath = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return '/dashboard';
    return '/' + segments.slice(0, -1).join('/');
  };

  return (
    <div className="flex min-h-[100vh] items-center justify-center p-4">
      <div className="surface-panel max-w-md p-6 text-center">
        <div className="mb-6">
          <div className="app-status-icon app-status-icon-warning mx-auto mb-4 h-12 w-12">
            <CircleAlert className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-white">Page not found</h1>
          <p className="mb-6 text-sm leading-6 text-[var(--text-secondary)]">
            The page you requested could not be found.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="app-button w-full"
          >
            Go back
          </button>

          <Link
            href={getParentPath()}
            prefetch={false}
            className="app-button-secondary block w-full"
          >
            Return to parent
          </Link>

          <Link
            href="/dashboard"
            prefetch={false}
            className="app-button-secondary block w-full"
          >
            Go to Today
          </Link>
        </div>
      </div>
    </div>
  );
}
