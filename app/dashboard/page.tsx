'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth/auth-client';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Client-side protection
  useEffect(() => {
    if (!isPending && !session) {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [session, isPending, router]);

  // Show isPending state while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500 text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect in useEffect)
  if (!session) {
    return null;
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.name || user.email}
                </span>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Profile
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Sign Out
                </Link>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Welcome to your personal dashboard, {user.name || 'User'}
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                This is your personalized dashboard. Here you can access your nutrition plans,
                track your progress, and connect with experts.
              </p>
            </div>
            <div className="mt-5">
              <Link href="/">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Home
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="font-semibold text-blue-700">Meal Plans</h4>
              <p className="mt-2 text-sm text-gray-600">Your personalized nutrition plans will appear here.</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="font-semibold text-purple-700">Expert Guidance</h4>
              <p className="mt-2 text-sm text-gray-600">Connect with nutritionists and health practitioners.</p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-700">Progress Tracking</h4>
              <p className="mt-2 text-sm text-gray-600">Monitor your health journey with analytics and insights.</p>
            </div>
          </div>

          {/* User profile information */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h4 className="text-lg font-medium text-gray-900">Your Profile</h4>
            <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name || 'Not provided'}</dd>
              </div>
              {/* <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.role || 'Client'}</dd>
              </div> */}
              <div>
                <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
