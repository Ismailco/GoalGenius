'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signIn, signUp, useSession } from '@/lib/auth/auth-client';
import { redirect } from 'next/navigation';
import { validateAndSanitizeInput, ValidationResult } from '@/lib/validation';
import { Feedback } from '@/components/common/Feedback';
import { getAuthError } from '@/lib/auth/auth-errors';

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  [key: string]: string | undefined;
}

export function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  if (session) {
    redirect('/dashboard');
  }

  const validateField = (name: string, value: string): ValidationResult => {
    switch (name) {
      case 'name':
        return validateAndSanitizeInput(value, 'title', mode === 'signup');
      case 'email':
        if (!value) {
          return { isValid: false, sanitizedValue: value, error: 'Email is required' };
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, sanitizedValue: value, error: 'Please enter a valid email address' };
        }
        return { isValid: true, sanitizedValue: value };
      case 'password':
        if (!value) {
          return { isValid: false, sanitizedValue: value, error: 'Password is required' };
        }
        if (mode === 'signup' && value.length < 8) {
          return { isValid: false, sanitizedValue: value, error: 'Password must be at least 8 characters long' };
        }
        if (mode === 'signup' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return {
            isValid: false,
            sanitizedValue: value,
            error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
          };
        }
        return { isValid: true, sanitizedValue: value };
      case 'passwordConfirm':
        if (mode === 'signup') {
          if (!value) {
            return { isValid: false, sanitizedValue: value, error: 'Please confirm your password' };
          }
          if (value !== formData.password) {
            return { isValid: false, sanitizedValue: value, error: 'Passwords do not match' };
          }
        }
        return { isValid: true, sanitizedValue: value };
      default:
        return { isValid: true, sanitizedValue: value };
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const validationResult = validateField(name, value);

    setFormData(prev => ({
      ...prev,
      [name]: validationResult.sanitizedValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: validationResult.error
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const emailValidation = validateField('email', formData.email);
    const passwordValidation = validateField('password', formData.password);
    const nameValidation = mode === 'signup'
      ? validateField('name', formData.name)
      : { isValid: true, sanitizedValue: '', error: undefined };
    const passwordConfirmValidation = mode === 'signup'
      ? validateField('passwordConfirm', formData.passwordConfirm)
      : { isValid: true, sanitizedValue: '', error: undefined };

    const newErrors: FormErrors = {};
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error;
    }
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error;
    }
    if (mode === 'signup' && !nameValidation.isValid) {
      newErrors.name = nameValidation.error;
    }
    if (mode === 'signup' && !passwordConfirmValidation.isValid) {
      newErrors.passwordConfirm = passwordConfirmValidation.error;
    }

    // If there are any validation errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await signIn.email({
          email: emailValidation.sanitizedValue,
          password: passwordValidation.sanitizedValue,
        });

        // Handle error in the result
        if (result?.error) {
          const errorMessage = result.error.message || 'Authentication failed. Please try again.';
          setError(errorMessage);

          // Clear password fields on error
          setFormData(prev => ({
            ...prev,
            password: '',
            passwordConfirm: '',
          }));
          return;
        }

        if (!result?.data) {
          throw new Error('Sign in failed');
        }
      } else {
        const result = await signUp.email({
          email: emailValidation.sanitizedValue,
          password: passwordValidation.sanitizedValue,
          name: nameValidation.sanitizedValue,
        });

        // Handle error in the result
        if (result?.error) {
          const errorMessage = result.error.message || 'Sign up failed. Please try again.';
          setError(errorMessage);

          // Clear password fields on error
          setFormData(prev => ({
            ...prev,
            password: '',
            passwordConfirm: '',
          }));
          return;
        }

        if (!result?.data) {
          throw new Error('Sign up failed');
        }
      }
    } catch (err) {
      // Get the error details
      const errorDetails = getAuthError(err);
      const errorMessage = errorDetails.message || 'Authentication failed. Please try again.';
      setError(errorMessage);

      // Clear password fields on error
      setFormData(prev => ({
        ...prev,
        password: '',
        passwordConfirm: '',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Brand Section - Left side on desktop, top on mobile */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col justify-center items-center text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth-bg-pattern.svg"
            alt="Background Pattern"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="max-w-md mx-auto text-center z-10">
          <div className="mb-6">
            <div className="relative h-20 w-60 mx-auto mb-4">
              <Image
                src="/images/logo_trans_white.png"
                alt="NutryFit Logo"
                width={200}
                height={100}
                className="w-full h-full drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold mb-2 drop-shadow-sm hidden">NutryFit</h1>
            <p className="text-lg opacity-90">Your journey to health and wellness begins here</p>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span>Personalized nutrition plans</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span>Expert guidance from practitioners</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span>Track your progress effortlessly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section - Right side on desktop, bottom on mobile */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="mt-2 text-gray-600">
              {mode === 'signin'
                ? 'Sign in to your account'
                : 'Sign up for a new account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Error message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      type="button"
                      className="inline-flex text-red-400 hover:text-red-500"
                      onClick={() => setError(null)}
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`block w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`block w-full rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`block w-full rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {mode === 'signup' && !errors.password && (
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 8 characters long and contain uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  className={`block w-full rounded-lg border ${
                    errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors`}
                  placeholder="••••••••"
                />
                {errors.passwordConfirm && (
                  <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || Object.keys(errors).some(key =>
                errors[key] && (mode === 'signin'
                  ? ['email', 'password'].includes(key)
                  : ['email', 'password', 'passwordConfirm', 'name'].includes(key))
              )}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => signIn.social({ provider: 'google' })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => signIn.social({ provider: 'github' })}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-600">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link href="/auth/signin" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
