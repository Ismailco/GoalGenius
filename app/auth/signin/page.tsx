'use client';

import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { LoadingPage } from '@/components/common/LoadingSpinner';

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
