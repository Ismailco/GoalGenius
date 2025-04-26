'use client';

import { ModalProvider } from '../app/providers/ModalProvider';
import { NotificationProvider } from '../app/providers/NotificationProvider';
import ServiceWorkerProvider from '../app/providers/ServiceWorkerProvider';
import { ErrorBoundary } from './ErrorBoundary';
import NotificationContainer from './NotificationContainer';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <ServiceWorkerProvider>
        <NotificationProvider>
          <ModalProvider>
            {children}
            <NotificationContainer />
          </ModalProvider>
        </NotificationProvider>
      </ServiceWorkerProvider>
    </ErrorBoundary>
  );
}
