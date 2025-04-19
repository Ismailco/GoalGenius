import { AuthForm } from '@/app/components/auth/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | NutryFit',
  description: 'Sign up for a new NutryFit account',
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}
