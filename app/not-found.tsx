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
    <div className="min-h-[100vh] flex items-center justify-center p-4 bg-slate-900">
      <div className="absolute top-16 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"></div>
      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-lg rounded-xl border border-slate-800 p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
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
          <h2 className="text-xl font-semibold text-slate-200 mb-2">Resource Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            The requested resource could not be found. You can return to the previous page or navigate to a safe location.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Go Back
          </button>

          <Link
            href={getParentPath()}
            className="block w-full px-4 py-2 border border-slate-700 hover:bg-slate-800/50 text-slate-300 rounded-md transition-colors"
          >
            Return to Safe Location
          </Link>

          <Link
            href="/dashboard"
            className="block w-full px-4 py-2 hover:bg-slate-800/50 text-slate-400 rounded-md transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-600">
          <p>Path: {pathname}</p>
        </div>
      </div>
    </div>
  );
}
