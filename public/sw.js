const CACHE_VERSION = '1';
const CACHE_NAMES = {
  static: `static-v${CACHE_VERSION}`,
  dynamic: `dynamic-v${CACHE_VERSION}`,
  offline: `offline-v${CACHE_VERSION}`
};

// Modified offline modal with online check
const OFFLINE_MODAL_HTML = `
<div id="offline-modal" style="display: none;">
    <style>
        #offline-modal {
            position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 1px 12px 1px 12px;
      background: rgb(239, 68, 68);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            z-index: 9999;
      text-align: center;
      transition: all 0.3s ease;
      transform: translateY(-100%);
                opacity: 0;
            }
    #offline-modal.visible {
      transform: translateY(0);
                opacity: 1;
            }
    #offline-modal.online {
      background: rgb(34, 197, 94);
    }
    #offline-modal .content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      max-width: 1200px;
      margin: 0 auto;
    }
    #offline-modal .icon {
      font-size: 16px;
    }
    #offline-modal .message {
      font-size: 14px;
      font-weight: 500;
        }
    </style>
  <div class="content">
    <div class="icon">📡</div>
    <div class="message">You're offline</div>
    </div>
</div>
<script>
(function checkConnectivity() {
    const modal = document.getElementById('offline-modal');
    let hideTimeout;
    let wasOffline = false; // Track previous connection state

    function updateOfflineStatus() {
        if (!modal) return;

        clearTimeout(hideTimeout);

        if (!navigator.onLine) {
            wasOffline = true; // Mark that we were offline
            modal.style.display = 'block';
            modal.classList.remove('online');
            modal.querySelector('.message').textContent = "You're offline";
            modal.classList.add('visible');
        } else if (wasOffline) { // Only show online banner if we were previously offline
            modal.style.display = 'block';
            modal.classList.add('online');
            modal.querySelector('.message').textContent = "You're back online";
            modal.classList.add('visible');

            // Hide after 2 seconds when online
            hideTimeout = setTimeout(() => {
                modal.classList.remove('visible');
                setTimeout(() => {
            modal.style.display = 'none';
                    wasOffline = false; // Reset the offline state
                }, 300); // Wait for transition to complete
            }, 2000);
        }
    }

    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);

    // Initial check - only show if we're offline
    if (!navigator.onLine) {
    updateOfflineStatus();
    }
})();
</script>
`;

// Full offline page for uncached routes
const OFFLINE_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - GoalGenius</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(to bottom, #1a1a1a, #000000);
            color: white;
            text-align: center;
            padding: 20px;
        }

        .offline-container {
            max-width: 500px;
            padding: 40px 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            color: #cccccc;
            line-height: 1.5;
        }

        .retry-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s;
            font-weight: 500;
        }

        .retry-button:hover {
            background: #2563eb;
        }

        .icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>This page isn't available offline. Please check your connection and try again.</p>
        <button class="retry-button" onclick="window.location.reload()">Try Again</button>
    </div>
</body>
</html>`;

// Public routes that should be cached
const PUBLIC_ROUTES = [
  '/',
  '/docs',
  '/sign-in',
  '/sign-up',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/favicon-64x64.png',
  '/favicon-128x128.png',
  '/favicon-256x256.png',
  '/_next/static/**/*'
];

// Protected routes that require auth
const PROTECTED_ROUTES = [
  '/dashboard',
  '/checkins',
  '/notes',
  '/todos'
];

// Combined app shell for caching
const APP_SHELL = [...PUBLIC_ROUTES];

// Helper functions
const isNavigationRequest = (request) => {
  // Check if it's a navigation AND if it's a GET request (refreshes are GET)
  return request.mode === 'navigate' && request.method === 'GET';
};
const isStaticAsset = (url) => {
  const parsedUrl = new URL(url);
  return parsedUrl.pathname.startsWith('/_next/static') ||
         parsedUrl.pathname.startsWith('/_next/data') ||
         parsedUrl.pathname.startsWith('/_next/image') ||
         parsedUrl.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/);
};
const isAPIRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
};
const isAuthRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.includes('/auth/') || // For Clerk
         url.pathname.includes('/__clerk') || // For Clerk handshake
         url.pathname.includes('handshake') || // For Clerk handshake
         url.hostname.includes('clerk.dev') || // For Clerk's domain
         url.hostname.includes('clerk.com') || // For Clerk's domain
         url.hostname.includes('clerk.accounts.dev'); // For Clerk's accounts domain
};

// Helper function to check if route is protected
const isProtectedRoute = (url) => {
  const pathname = new URL(url).pathname;
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
};

// Cache strategies
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (navigator.onLine) {
    const networkResponsePromise = fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse.ok) {
          await cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails, return cached response
        if (cachedResponse) {
          return cachedResponse;
        }
        throw new Error('No cached response available');
      });

    // Return cached response immediately if available, otherwise wait for network
    return cachedResponse || networkResponsePromise;
  }

  // If offline and we have a cached response, return it
  if (cachedResponse) {
    return cachedResponse;
  }
  throw new Error('No cached response available and offline');
}

async function networkFirst(request, cacheName) {
  if (navigator.onLine) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  } else {
    // If offline, try cache first
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw new Error('Offline and no cached response available');
  }
}

// Background sync queue
const syncQueue = new Set();

// Helper function to cache all Next.js chunks
async function cacheNextJsChunks(cache) {
  try {
    const mainResponse = await fetch('/_next/static/chunks/main.js');
    if (mainResponse.ok) {
      await cache.put('/_next/static/chunks/main.js', mainResponse.clone());

      // Extract and cache all chunk URLs from the main bundle
      const mainText = await mainResponse.text();
      const chunkUrls = Array.from(mainText.matchAll(/"(\/_next\/static\/chunks\/[^"]+)"/g))
        .map(match => match[1]);

      // Cache each chunk
      await Promise.all(
        chunkUrls.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response.clone());
            }
          } catch (error) {
            console.warn('Failed to cache chunk:', url, error);
          }
        })
      );
    }
  } catch (error) {
    console.warn('Failed to cache Next.js chunks:', error);
  }
}

// Helper function to inject offline modal into HTML
async function injectOfflineModal(response) {
  const html = await response.text();
  const modifiedHtml = html.replace(
    /<\/body>/i,
    `${OFFLINE_MODAL_HTML}</body>`
  );
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(modifiedHtml, { headers });
}

// Install event - cache app shell and handle Next.js static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAMES.static).then(async (cache) => {
        // Cache the basic app shell first
        await cache.addAll(APP_SHELL.filter(url => !url.includes('**')));

        // Then try to cache any existing Next.js static files
        try {
          const existingStaticFiles = await fetch('/_next/static/chunks/manifest.json')
            .then(res => res.json())
            .then(manifest => Object.values(manifest).flat())
            .catch(() => []);

          await cache.addAll(existingStaticFiles);
        } catch (error) {
          console.warn('Could not cache all Next.js static files:', error);
        }
      }),
      caches.open(CACHE_NAMES.offline).then((cache) => {
        return cache.put('/offline', new Response(OFFLINE_PAGE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        }));
      })
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            const [type, version] = key.split('-v');
            if (version !== CACHE_VERSION) {
              return caches.delete(key);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event - handle different types of requests
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Pass through all auth requests directly to network
  if (isAuthRequest(request)) {
    return fetch(request);
  }

  // API requests - network first
  if (isAPIRequest(request)) {
    event.respondWith(
      networkFirst(request, CACHE_NAMES.dynamic).catch(() => {
        // If offline, queue for sync and return offline response
        if (request.method !== 'GET') {
          syncQueue.add({
            request: request.clone(),
            timestamp: Date.now()
          });
        }
        return new Response(
                JSON.stringify({ error: 'You are offline' }),
                {
                  status: 503,
            headers: { 'Content-Type': 'application/json' }
                }
              );
        })
    );
    return;
  }

  // Static assets - stale while revalidate with better offline handling
  if (isStaticAsset(request.url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAMES.static);
        const cachedResponse = await cache.match(request);

          if (cachedResponse) {
          // If we have it cached, return it immediately
          if (navigator.onLine) {
            // Update cache in background if online
            fetch(request)
              .then(async (networkResponse) => {
                if (networkResponse.ok) {
                  await cache.put(request, networkResponse.clone());
                }
              })
              .catch(() => {/* ignore network errors */});
          }
          return cachedResponse;
        }

        // If not cached and online, try network and cache
        if (navigator.onLine) {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              await cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            // Network error, try to return any cached version
            const cachedVersion = await cache.match(request);
            if (cachedVersion) return cachedVersion;

            // If it's a JS chunk, return an empty JS file to prevent errors
            if (request.url.endsWith('.js')) {
              return new Response(
                `(self.webpackChunk = self.webpackChunk || []).push([[0], {}, function(){}]);`,
                {
                  headers: {
                    'Content-Type': 'application/javascript',
                    'Cache-Control': 'no-store'
                  }
                }
              );
            }
            throw error;
          }
        }

        // If offline and not cached, handle gracefully
        if (request.url.endsWith('.js')) {
          return new Response(
            `(self.webpackChunk = self.webpackChunk || []).push([[0], {}, function(){}]);`,
            {
              headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-store'
              }
            }
          );
        }

        throw new Error('Static asset not available offline');
      })()
    );
    return;
  }

  // Navigation requests - check both caches, then network with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        // Check if it's a protected route
        if (isProtectedRoute(request.url)) {
          // Try to get auth status from request headers or cookies
          const authHeader = request.headers.get('Authorization');
          const hasAuth = authHeader && authHeader.startsWith('Bearer ');

          if (!hasAuth && navigator.onLine) {
            // Redirect to sign-in if not authenticated
            return Response.redirect('/sign-in?redirect=' + encodeURIComponent(request.url), 302);
          }

          if (!hasAuth && !navigator.onLine) {
            // If offline and not authenticated, show offline auth required page
            return new Response(
              `<!DOCTYPE html>
              <html>
                <head>
                  <title>Authentication Required</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>${OFFLINE_STYLES}</style>
                </head>
                <body>
                  <div class="offline-container">
                    <div class="icon">🔒</div>
                    <h1>Authentication Required</h1>
                    <p>Please sign in to access this page. You must be online to authenticate.</p>
                    <button class="retry-button" onclick="window.location.href='/sign-in'">Sign In</button>
                  </div>
                </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' },
                status: 401
              }
            );
          }
        }

        // Continue with existing navigation request handling
        const staticCache = await caches.open(CACHE_NAMES.static);
        const dynamicCache = await caches.open(CACHE_NAMES.dynamic);

        // Check static cache first (pre-cached routes)
        let cachedResponse = await staticCache.match(request);

        // If not in static cache, check dynamic cache
        if (!cachedResponse) {
          cachedResponse = await dynamicCache.match(request);
        }

          if (cachedResponse) {
          // If we have it cached, return it and update cache in background only if online
          if (navigator.onLine) {
            fetch(request).then(async (networkResponse) => {
              if (networkResponse.ok) {
                const modifiedResponse = await injectOfflineModal(networkResponse.clone());
                await dynamicCache.put(request, modifiedResponse);
                // Cache all related chunks when a page is visited
                await cacheNextJsChunks(staticCache);
              }
            }).catch(() => {/* ignore network errors */});
          }
          return injectOfflineModal(cachedResponse);
        }

        // If not in either cache, try network if online
        if (navigator.onLine) {
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              const modifiedResponse = await injectOfflineModal(networkResponse.clone());
              await dynamicCache.put(request, modifiedResponse);
              // Cache all related chunks when a new page is visited
              await cacheNextJsChunks(staticCache);
              return injectOfflineModal(networkResponse);
            }
            return networkResponse;
          } catch (error) {
            // Network error, fall through to offline page
          }
        }

        // If offline or network failed, show offline page from cache
        const offlineCache = await caches.open(CACHE_NAMES.offline);
        const offlinePage = await offlineCache.match('/offline');
        return offlinePage || new Response(OFFLINE_PAGE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        });
      })()
    );
    return;
  }

  // Default - stale while revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.dynamic));
});

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-changes' && navigator.onLine) {
    event.waitUntil(
      Promise.all(
        Array.from(syncQueue).map(async ({ request }) => {
          try {
            await fetch(request);
            syncQueue.delete(request);
          } catch (error) {
            console.error('Background sync failed:', error);
          }
        })
      )
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: data.data,
      actions: data.actions,
      vibrate: [100, 50, 100],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'GoalGenius', options)
    );
  }
});

// Add auth check interval
setInterval(async () => {
  if (navigator.onLine) {
    try {
      const response = await fetch('/api/auth/check');
      if (!response.ok) {
        // Clear protected route caches if auth is invalid
        const cache = await caches.open(CACHE_NAMES.dynamic);
        for (const route of PROTECTED_ROUTES) {
          await cache.delete(route);
        }
      }
    } catch (error) {
      console.warn('Auth check failed:', error);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes
