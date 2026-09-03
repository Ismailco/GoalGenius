'use client';

import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signin" />
    </Suspense>
  );
}
