const CACHE_VERSION = 'v4';
const APP_SHELL_CACHE = `goalgenius-app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `goalgenius-runtime-${CACHE_VERSION}`;
const STATIC_CACHE = `goalgenius-static-${CACHE_VERSION}`;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);
const IS_LOCAL_HOST = LOCAL_HOSTNAMES.has(self.location.hostname);

const APP_ROUTES = [
  '/',
  '/dashboard',
  '/todos',
  '/checkins',
  '/notes',
  '/goals',
  '/milestones',
  '/calendar',
  '/analytics',
  '/settings',
  '/docs',
  '/auth/signin',
  '/auth/signup',
];

const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.ico',
  '/splash.svg',
  '/images/logo.png',
  '/images/logo_full.png',
  '/images/logo_trans_white.png',
  '/images/logo_trans_dark.png',
  '/images/logo_full_trans_white.png',
  '/images/logo_full_trans_dark.png',
];

const PRECACHE_URLS = [...APP_ROUTES, ...STATIC_ASSETS];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function shouldSkipRequest(request) {
  const url = new URL(request.url);

  return (
    request.method !== 'GET' ||
    !isSameOrigin(url) ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    (IS_LOCAL_HOST && url.pathname.startsWith('/_next/')) ||
    request.headers.has('authorization')
  );
}

async function notifyClients(message) {
  const clientsList = await self.clients.matchAll({ includeUncontrolled: true });
  clientsList.forEach((client) => client.postMessage(message));
}

async function cacheUrl(cacheName, url) {
  const cache = await caches.open(cacheName);
  const request = new Request(url, { credentials: 'same-origin' });
  const response = await fetch(request);

  if (!response.ok && response.type !== 'opaqueredirect') {
    throw new Error(`Failed to cache ${url}: ${response.status}`);
  }

  if (response.headers.get('content-type')?.includes('text/html')) {
    await cacheLinkedStaticAssets(response.clone());
  }

  await cache.put(request, response);
}

async function cacheLinkedStaticAssets(response) {
  const html = await response.text();
  const staticAssetUrls = new Set();
  const assetPattern = /(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g;
  let match = assetPattern.exec(html);

  while (match) {
    staticAssetUrls.add(new URL(match[1], self.location.origin).toString());
    match = assetPattern.exec(html);
  }

  if (staticAssetUrls.size === 0) return;

  const cache = await caches.open(STATIC_CACHE);

  await Promise.all(
    [...staticAssetUrls].map(async (assetUrl) => {
      const request = new Request(assetUrl, { credentials: 'same-origin' });
      const cachedResponse = await cache.match(request);

      if (cachedResponse) return;

      const assetResponse = await fetch(request);
      if (assetResponse.ok) {
        await cache.put(request, assetResponse);
      }
    }),
  );
}

async function cacheAppPages() {
  const failedUrls = [];

  for (const url of PRECACHE_URLS) {
    try {
      await cacheUrl(APP_ROUTES.includes(url) ? APP_SHELL_CACHE : STATIC_CACHE, url);
    } catch (error) {
      failedUrls.push(url);
      console.warn('[ServiceWorker] Cache failed:', url, error);
    }
  }

  await notifyClients({
    type: 'CACHE_COMPLETE',
    version: CACHE_VERSION,
    success: failedUrls.length === 0,
    failedUrls,
  });
}

async function cacheStaticAssets() {
  for (const url of STATIC_ASSETS) {
    try {
      await cacheUrl(STATIC_CACHE, url);
    } catch (error) {
      console.warn('[ServiceWorker] Static asset cache failed:', url, error);
    }
  }
}

async function cleanupOldCaches() {
  const currentCaches = new Set([APP_SHELL_CACHE, RUNTIME_CACHE, STATIC_CACHE]);
  const cacheNames = await caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith('goalgenius-') && !currentCaches.has(cacheName))
      .map((cacheName) => caches.delete(cacheName)),
  );
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('GoalGenius is offline.', {
        headers: { 'Content-Type': 'text/plain' },
        status: 503,
      });
    }

    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        void cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(cacheStaticAssets());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_HOST) {
    return;
  }

  const { request } = event;
  const url = new URL(request.url);

  if (shouldSkipRequest(request)) {
    return;
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_PAGES') {
    event.waitUntil(cacheAppPages());
  }
});
