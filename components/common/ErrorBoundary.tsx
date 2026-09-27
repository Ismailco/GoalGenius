'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function isNextControlFlowError(error: unknown) {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }

  const digest = String((error as { digest?: unknown }).digest);
  return (
    digest.startsWith("NEXT_REDIRECT") ||
    digest.startsWith("NEXT_NOT_FOUND") ||
    digest.startsWith("NEXT_HTTP_ERROR_FALLBACK")
  );
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (isNextControlFlowError(error)) {
      throw error;
    }

    // Log the error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Add proper error logging service here (e.g., Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-canvas)] p-4">
          <div className="surface-panel w-full max-w-lg p-6 text-center sm:p-8" role="alert">
            <div className="app-status-icon app-status-icon-danger mx-auto mb-4" aria-hidden="true">
              !
            </div>
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Rungset could not finish loading this view. Refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="app-button mt-6"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
