'use client';

import { useEffect } from 'react';

// Function to trigger caching of app pages
export const cacheAppPages = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({ type: 'CACHE_PAGES' });
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
      });
    } catch (error) {
      console.error('Failed to initiate caching:', error);
      throw error;
    }
  } else {
    console.warn('Service Worker is not ready yet');
    return Promise.reject(new Error('Service Worker not ready'));
  }
};

export default function ServiceWorkerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg.scope);

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
  }, []);

  return children;
}
