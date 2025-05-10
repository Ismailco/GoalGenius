interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`relative ${className}`} role="status" aria-label="Loading">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className="h-full w-full rounded-full border-4 border-blue-500/30 border-t-blue-500"></div>
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  role?: string;
  'aria-label'?: string;
}

export function LoadingOverlay({ role = 'status', 'aria-label': ariaLabel = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div
      className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      role={role}
      aria-label={ariaLabel}
    >
      <LoadingSpinner size="large" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading page">
      <div className="text-center">
        <LoadingSpinner size="large" className="mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
