'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface AppModalProps {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  role?: 'dialog' | 'alertdialog';
  labelledBy?: string;
  ariaLabel?: string;
  initialFocus?: 'first' | 'close';
  closeDisabled?: boolean;
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function AppModal({
  title,
  description,
  children,
  onClose,
  size = 'md',
  role = 'dialog',
  labelledBy,
  ariaLabel,
  initialFocus = 'first',
  closeDisabled = false,
}: AppModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const target = initialFocus === 'close' ? closeRef.current : focusable?.[1] ?? closeRef.current;
    target?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !closeDisabled) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [closeDisabled, initialFocus, onClose]);

  const sizeClass = size === 'sm'
    ? 'app-modal-panel-sm'
    : size === 'lg'
      ? 'app-modal-panel-lg'
      : '';

  return (
    <div className="app-modal-backdrop">
      <div
        ref={dialogRef}
        className={`app-modal-panel ${sizeClass} flex max-h-[86vh] flex-col`}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy ?? titleId}
        aria-label={ariaLabel}
      >
        <div className="app-modal-header flex shrink-0 items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={labelledBy ?? titleId} className="text-lg font-semibold text-white sm:text-xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            className="app-button-ghost app-button-icon app-button-sm shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="app-modal-content min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
