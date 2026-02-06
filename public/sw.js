/**
 * OKZ Sports - Service Worker
 * /Users/lesedimalapile/Downloads/okz-frontend/public/sw.js
 */

const CACHE_NAME = 'okz-sports-cache-v1';

// Assets to cache immediately on install
const PRE_CACHE_ASSETS = [
    '/',
    '/index.html',
    '/favicon.ico'
];

// 1. Install Event: Pre-cache static UI shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-caching offline shell');
                return cache.addAll(PRE_CACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Fetch Event: Network-first strategy for API, Cache-first for Assets
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip caching for API calls to ensure real-time booking data
    if (url.pathname.startsWith('/api/v1')) {
        return; 
    }

    // For all other requests (CSS, JS, Images), try cache then network
    event.respondWith(
        caches.match(request).then((response) => {
            return response || fetch(request).then((networkResponse) => {
                // Don't cache if not a successful GET request
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });

                return networkResponse;
            });
        }).catch(() => {
            // If both fail and it's a navigation request, return index.html
            if (request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});