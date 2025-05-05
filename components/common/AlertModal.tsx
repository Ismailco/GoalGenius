'use client';

interface AlertModalProps {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  isConfirmation?: boolean;
  onConfirm?: () => void;
  'aria-label'?: string;
  role?: 'alertdialog' | 'dialog';
}

export default function AlertModal({
  title,
  message,
  type,
  onClose,
  isConfirmation,
  onConfirm,
  'aria-label': ariaLabel,
  role = 'alertdialog'
}: AlertModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        );
      case 'warning':
        return (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        );
      case 'error':
        return (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        );
      default:
        return (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role={role}
      aria-label={ariaLabel || `${type} alert: ${title}`}
      aria-modal="true"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl w-full max-w-md border border-white/10">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getBackgroundColor()}`}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {getIcon()}
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-1 text-gray-300">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Close alert"
                >
              {isConfirmation ? 'Cancel' : 'Close'}
                </button>
            {isConfirmation && onConfirm && (
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-xl hover:from-red-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200"
                aria-label="Confirm action"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
