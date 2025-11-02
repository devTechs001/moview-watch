// Fetch event handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle Socket.IO requests
  if (url.pathname.includes('/socket.io')) {
    // Don't cache socket.io requests, just pass through
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Add CORS headers if needed
          const newHeaders = new Headers(response.headers);
          if (ALLOWED_ORIGINS.includes(url.origin)) {
            newHeaders.set('Access-Control-Allow-Origin', url.origin);
            newHeaders.set('Access-Control-Allow-Credentials', 'true');
          }
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        })
        .catch(error => {
          console.log('[SW] Socket.IO fetch failed:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to connect to server' }),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': url.origin,
                'Access-Control-Allow-Credentials': 'true'
              }
            }
          );
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful GET requests
          if (event.request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE).then(cache => {
              const cacheKey = new Request(event.request.url, {
                mode: 'cors',
                credentials: 'include'
              });
              cache.put(cacheKey, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          // Try to get from cache for GET requests
          if (event.request.method === 'GET') {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
          }
          
          // Return error response if nothing found in cache
          return new Response(
            JSON.stringify({ error: 'Network error occurred' }),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': url.origin,
                'Access-Control-Allow-Credentials': 'true'
              }
            }
          );
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }

            // Cache successful responses to static assets
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Network error occurred', { status: 503 });
          });
      })
  );
});