'use client';

import { ModalProvider } from '../providers/ModalProvider';
import { NotificationProvider } from '../providers/NotificationProvider';
import ServiceWorkerProvider from '../providers/ServiceWorkerProvider';
import NotificationContainer from './NotificationContainer';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServiceWorkerProvider>
      <NotificationProvider>
        <ModalProvider>
          {children}
          <NotificationContainer />
        </ModalProvider>
      </NotificationProvider>
    </ServiceWorkerProvider>
  );
}
