'use client';

import { useEffect } from 'react';
import { syncWorkspaceData } from '@/lib/storage';
import { WORKSPACE_SYNC_EVENT } from '@/lib/workspace-sync-events';

// Function to trigger caching of app pages
export const cacheAppPages = async () => {
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
};

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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

      try {
        await cacheAppPages();
      } catch (error) {
        console.warn('Offline app cache could not be refreshed yet:', error);
      }
    };

    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg.scope);
          void navigator.serviceWorker.ready.then(() => prepareOfflineApp());

          // Listen for messages from the service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'CACHE_COMPLETE') {
              if (event.data.success) {
                localStorage.setItem('pwaCacheReady', 'true');
                console.log('✅ App pages cached successfully');
              } else {
                console.warn('⚠️ Some pages failed to cache:', event.data.failedUrls);
              }
            } else if (event.data.type === 'CACHE_ERROR') {
              console.error('❌ Cache error:', event.data.error);
            }
          });
        })
        .catch((err) => console.error('❌ SW registration failed:', err));
    }

    const handleOnline = () => {
      void prepareOfflineApp();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return children;
}
