'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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
          <div className="icon-chip mx-auto mb-4 h-16 w-16 rounded-[20px]">
            <svg
              className="h-8 w-8 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Resource Not Found</h2>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            The requested resource could not be found. You can return to the previous page or navigate to a safe location.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="app-button w-full"
          >
            Go Back
          </button>

          <Link
            href={getParentPath()}
            className="app-button-secondary block w-full"
          >
            Return to Safe Location
          </Link>

          <Link
            href="/dashboard"
            className="app-button-secondary block w-full"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-6 text-xs text-[var(--text-muted)]">
          <p>Path: {pathname}</p>
        </div>
      </div>
    </div>
  );
}
