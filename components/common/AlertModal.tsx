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
      className="app-modal-backdrop"
      role={role}
      aria-label={ariaLabel || `${type} alert: ${title}`}
      aria-modal="true"
    >
      <div className="app-modal-panel app-modal-panel-sm">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className={`rounded-2xl border p-3 ${getBackgroundColor()}`}>
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {getIcon()}
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-1 text-[var(--text-secondary)]">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="app-button-secondary !px-4"
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
                className="app-button-danger"
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
