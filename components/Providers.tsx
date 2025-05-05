'use client';

import { ModalProvider } from '../app/providers/ModalProvider';
import { NotificationProvider } from '../app/providers/NotificationProvider';
import ServiceWorkerProvider from '../app/providers/ServiceWorkerProvider';
import { StorageProvider } from '../app/providers/StorageProvider';
import { ErrorBoundary } from './common/ErrorBoundary';
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
            <StorageProvider>
              {children}
              <NotificationContainer />
            </StorageProvider>
          </ModalProvider>
        </NotificationProvider>
      </ServiceWorkerProvider>
    </ErrorBoundary>
  );
}
