'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export default function Notification({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
            <svg className="h-6 w-6 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
            <svg className="h-6 w-6 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
            <svg className="h-6 w-6 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
            <svg className="h-6 w-6 text-[var(--info)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationClass = () => {
    switch (type) {
      case 'success':
        return 'app-notification-success';
      case 'error':
        return 'app-notification-danger';
      case 'warning':
        return 'app-notification-warning';
      default:
        return 'app-notification-info';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`app-notification fixed top-4 right-4 z-50 p-4 ${getNotificationClass()}`}
          role="alert"
          aria-labelledby={`notification-${id}-title`}
          aria-describedby={`notification-${id}-message`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 pt-0.5">
              <h3
                id={`notification-${id}-title`}
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                {title}
              </h3>
              <p
                id={`notification-${id}-message`}
                className="mt-1 text-sm text-[var(--text-secondary)]"
              >
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose(id), 300);
              }}
              className="app-button-ghost app-button-icon !min-h-8 !h-8 !w-8 text-[var(--text-muted)]"
              aria-label="Close notification"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
