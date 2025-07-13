// Define the cache name
const CACHE_NAME = 'ss-cargo-cache-v1';

// List of files to cache
const urlsToCache = [
  '/',
  '/login',
  '/dashboard',
  '/dashboard/waybills',
  '/dashboard/waybills/create',
  '/dashboard/manifest',
  '/dashboard/sales',
  '/dashboard/print-sticker',
  '/globals.css',
  // Add other important assets here. Be mindful of caching too much.
  // For Next.js, specific JS chunks are harder to predict,
  // so we'll rely on runtime caching for those.
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all core assets to the cache
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it also is a stream.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // We don't want to cache print pages or API calls
                if (event.request.url.includes('/print/') || event.request.url.includes('/api/')) {
                  return;
                }
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
