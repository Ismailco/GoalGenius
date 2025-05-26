// const CACHE_NAME = 'full-app-cache-v2';
// const ASSETS_TO_CACHE = [
// 	'/',
// 	'/dashboard',
// 	'/signin',
// 	'/signup',
// 	'/todos',
// 	'/checkins',
// 	'/notes',
// 	'/goals',
// 	'/milestones',
//   '/calendar',
//   '/analytics',
//   '/profile',
//   '/settings',
//   '/manifest.json',
//   '/favicon-16x16.png',
//   '/splash.svg'
// ];

// // Cache app pages function that can be called after login
// const cacheAppPages = async () => {
// 	const cache = await caches.open(CACHE_NAME);
// 	const failedUrls = [];

// 	try {
// 		// Cache each URL individually to handle failures gracefully
// 		for (const url of ASSETS_TO_CACHE) {
// 			try {
// 				const response = await fetch(url);
// 				if (response.ok) {
// 					await cache.put(url, response);
// 					console.log(`✅ Cached: ${url}`);
// 				} else {
// 					failedUrls.push(url);
// 					console.log(`❌ Failed to cache: ${url} - Status: ${response.status}`);
// 				}
// 			} catch (err) {
// 				failedUrls.push(url);
// 				console.log(`❌ Failed to cache: ${url} - Error: ${err.message}`);
// 			}
// 		}

// 		// Notify the client about caching completion
// 		self.clients.matchAll().then(clients => {
// 			clients.forEach(client => {
// 				client.postMessage({
// 					type: 'CACHE_COMPLETE',
// 					success: failedUrls.length === 0,
// 					failedUrls
// 				});
// 			});
// 		});
// 	} catch (err) {
// 		console.error('Failed to cache app pages:', err);
// 		self.clients.matchAll().then(clients => {
// 			clients.forEach(client => {
// 				client.postMessage({
// 					type: 'CACHE_ERROR',
// 					error: err.message
// 				});
// 			});
// 		});
// 	}
// };

// self.addEventListener('install', (event) => {
// 	self.skipWaiting(); // Activate worker immediately
// });

// self.addEventListener('activate', (event) => {
// 	// Clean up old caches
// 	event.waitUntil(
// 		Promise.all([
// 			clients.claim(),
// 			caches.keys().then(cacheNames => {
// 				return Promise.all(
// 					cacheNames
// 						.filter(cacheName => cacheName !== CACHE_NAME)
// 						.map(cacheName => caches.delete(cacheName))
// 				);
// 			})
// 		])
// 	);
// });

// // Helper to exclude API and auth-related requests
// const shouldSkip = (request) => {
// 	return (
// 		request.method !== 'GET' ||
// 		request.url.includes('/api/') ||
// 		request.headers.get('Authorization')
// 	);
// };

// self.addEventListener('fetch', (event) => {
// 	const { request } = event;

// 	if (shouldSkip(request)) return;

// 	event.respondWith(
// 		caches.match(request)
// 			.then(cachedResponse => {
// 				// Return cached response if found
// 				if (cachedResponse) {
// 					// Try to update cache in background
// 					fetch(request)
// 						.then(networkResponse => {
// 							if (networkResponse.ok) {
// 								caches.open(CACHE_NAME)
// 									.then(cache => cache.put(request, networkResponse))
// 									.catch(err => console.warn('Background cache update failed:', err));
// 							}
// 						})
// 						.catch(() => {/* ignore background fetch errors */});

// 					return cachedResponse;
// 				}

// 				// If not in cache, try network
// 				return fetch(request)
// 					.then(networkResponse => {
// 						// Don't cache non-success responses
// 						if (!networkResponse.ok) {
// 							return networkResponse;
// 						}

// 						// Cache successful responses
// 						if (
// 							request.url.startsWith(self.location.origin) &&
// 							!request.url.includes('/api/')
// 						) {
// 							const responseToCache = networkResponse.clone();
// 							caches.open(CACHE_NAME)
// 								.then(cache => cache.put(request, responseToCache))
// 								.catch(err => console.warn('Cache put failed:', err));
// 						}

// 						return networkResponse;
// 					})
// 					.catch(error => {
// 						console.error('Fetch failed:', error);
// 						// Return a custom offline response
// 						return new Response(
// 							JSON.stringify({
// 								error: 'You are offline',
// 								message: 'Please check your internet connection'
// 							}),
// 							{
// 								headers: { 'Content-Type': 'application/json' }
// 							}
// 						);
// 					});
// 			})
// 	);
// });

// // Listen for messages from the client
// self.addEventListener('message', (event) => {
// 	if (event.data && event.data.type === 'CACHE_PAGES') {
// 		cacheAppPages();
// 	}
// });

// Simple Service Worker for PWA installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated');
});

self.addEventListener('fetch', (event) => {
  // Minimal fetch handler to make the app installable
  event.respondWith(fetch(event.request));
});
