import { AuthForm } from '@/app/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | NutryFit',
  description: 'Sign in to your NutryFit account',
};

export default function SignInPage() {
  return <AuthForm mode="signin" />;
}
