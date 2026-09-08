'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isPublicPath } from '@/components/app/shared/navigation';
import { syncWorkspaceData } from '@/lib/storage';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';

const PWA_CACHE_VERSION = 'v4';
const PWA_CACHE_VERSION_KEY = 'pwaCacheVersion';
const isProductionBuild = process.env.NODE_ENV === 'production';

export const cacheAppPages = async (): Promise<boolean> => {
  if (!isProductionBuild) {
    return false;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const serviceWorker = navigator.serviceWorker.controller ?? registration.active;

      if (!serviceWorker) {
        throw new Error('Service Worker not ready');
      }

      return new Promise((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.data.type === 'CACHE_COMPLETE') {
            navigator.serviceWorker.removeEventListener('message', messageHandler);
            if (event.data.success) {
              localStorage.setItem('pwaCacheReady', 'true');
              localStorage.setItem(
                PWA_CACHE_VERSION_KEY,
                event.data.version ?? PWA_CACHE_VERSION,
              );
              console.log('✅ App pages cached successfully');
              resolve(true);
            } else {
              console.warn('⚠️ Some pages failed to cache:', event.data.failedUrls);
              resolve(false);
            }
          } else if (event.data.type === 'CACHE_ERROR') {
            navigator.serviceWorker.removeEventListener('message', messageHandler);
            console.error('❌ Cache error:', event.data.error);
            reject(new Error(event.data.error));
          }
        };
        navigator.serviceWorker.addEventListener('message', messageHandler);
        serviceWorker.postMessage({ type: 'CACHE_PAGES' });
      });
    } catch (error) {
      console.error('Failed to initiate caching:', error);
      throw error;
    }
  } else {
    return Promise.reject(new Error('Service Worker unsupported'));
  }

  return false;
};

async function disableDevelopmentServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(
      cacheKeys
        .filter((cacheKey) => cacheKey.startsWith('goalgenius-'))
        .map((cacheKey) => caches.delete(cacheKey)),
    );
  }

  localStorage.removeItem('pwaCacheReady');
  localStorage.removeItem(PWA_CACHE_VERSION_KEY);
}

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const shouldPrepareOfflinePages = !isPublicPath(pathname);

  useEffect(() => {
    const prepareOfflineApp = async () => {
      if (navigator.onLine) {
        try {
          await syncWorkspaceData();
          window.dispatchEvent(new Event(WORKSPACE_SYNC_EVENT));
        } catch (error) {
          console.warn('Offline changes could not be synced yet:', error);
        }
      }

      const cachedVersion = localStorage.getItem(PWA_CACHE_VERSION_KEY);
      if (shouldPrepareOfflinePages && cachedVersion !== PWA_CACHE_VERSION) {
        try {
          await cacheAppPages();
        } catch (error) {
          console.warn('Offline app cache could not be refreshed yet:', error);
        }
      }
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data.type === 'CACHE_COMPLETE') {
        if (event.data.success) {
          localStorage.setItem('pwaCacheReady', 'true');
          localStorage.setItem(
            PWA_CACHE_VERSION_KEY,
            event.data.version ?? PWA_CACHE_VERSION,
          );
          console.log('✅ App pages cached successfully');
        } else {
          console.warn('⚠️ Some pages failed to cache:', event.data.failedUrls);
        }
      } else if (event.data.type === 'CACHE_ERROR') {
        console.error('❌ Cache error:', event.data.error);
      }
    };

    if ('serviceWorker' in navigator) {
      if (!isProductionBuild) {
        void disableDevelopmentServiceWorkers().catch((error) => {
          console.warn('Development service worker cleanup failed:', error);
        });
      } else {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('✅ Service Worker registered:', reg.scope);
            void navigator.serviceWorker.ready.then(() => prepareOfflineApp());
          })
          .catch((err) => console.error('❌ SW registration failed:', err));

        navigator.serviceWorker.addEventListener(
          'message',
          handleServiceWorkerMessage,
        );
      }
    }

    const handleOnline = () => {
      void prepareOfflineApp();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener(
          'message',
          handleServiceWorkerMessage,
        );
      }
    };
  }, [shouldPrepareOfflinePages]);

  return children;
}
