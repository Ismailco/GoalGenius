'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, CircleAlert, Info } from 'lucide-react';
import AppModal from '@/components/app/shared/AppModal';

interface AlertModalProps {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
  isConfirmation?: boolean;
  onConfirm?: () => void | Promise<void>;
  confirmLabel?: string;
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
  confirmLabel = 'Confirm',
  'aria-label': ariaLabel,
  role = 'alertdialog'
}: AlertModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  function handleConfirm() {
    if (isConfirming) return;
    setIsConfirming(true);
    onConfirm?.();
    onClose();
  }

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5" aria-hidden="true" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" aria-hidden="true" />;
      case 'error': return <CircleAlert className="h-5 w-5" aria-hidden="true" />;
      default: return <Info className="h-5 w-5" aria-hidden="true" />;
    }
  };

  const getStatusClass = () => {
    switch (type) {
      case 'success':
        return 'app-status-icon-success';
      case 'warning':
        return 'app-status-icon-warning';
      case 'error':
        return 'app-status-icon-danger';
      default:
        return 'app-status-icon-info';
    }
  };

  return (
    <AppModal title={title} onClose={onClose} size="sm" role={role} initialFocus="close" ariaLabel={ariaLabel} closeDisabled={isConfirming}>
      <div className="flex items-start gap-3">
        <div className={`app-status-icon ${getStatusClass()}`}>{getIcon()}</div>
        <p className="min-w-0 flex-1 text-sm leading-6 text-[var(--text-secondary)]">{message}</p>
      </div>
      <div className="app-modal-footer mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} disabled={isConfirming} aria-label={!isConfirmation ? 'Close alert' : undefined} className="app-button-secondary">
          {isConfirmation ? 'Cancel' : 'Close'}
        </button>
        {isConfirmation && onConfirm ? (
          <button type="button" onClick={handleConfirm} disabled={isConfirming} className="app-button-danger">
            {confirmLabel}
          </button>
        ) : null}
      </div>
    </AppModal>
  );
}
