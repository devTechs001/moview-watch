// Enhanced Service Worker for CinemaFlix PWA with Real-time Updates
// Bump cache version to force clients to update cached bundles (helps in dev)
const CACHE_VERSION = '1.1.3'
const CACHE_NAME = `cinemaflix-v${CACHE_VERSION}`
const STATIC_CACHE = `cinemaflix-static-v${CACHE_VERSION}`
const DYNAMIC_CACHE = `cinemaflix-dynamic-v${CACHE_VERSION}`
const API_CACHE = `cinemaflix-api-v${CACHE_VERSION}`

// Cache duration for API responses (5 minutes)
const API_CACHE_DURATION = 5 * 60 * 1000

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  '/assets/icons/apple-touch-icon.png',
  // Critical JS and CSS files
  '/index.js',
  '/assets/index.css',
  // Offline page assets
  '/offline.js',
  '/offline.css'
]

// CORS-enabled domains - Update these with your actual domains
const ALLOWED_ORIGINS = [
  self.location.origin, // Current origin
  'https://cinemaflxc.netlify.app',
  'https://cinemaflx-server.onrender.com'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
          .catch(error => {
            console.error('[SW] Failed to cache some static assets:', error)
            // Continue despite errors - don't block installation
            return Promise.resolve()
          })
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to complete installation:', error)
        // Continue despite errors
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
            ) {
              console.log('[SW] Removing old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service worker activated')
        return self.clients.claim()
      })
      .catch(error => {
        console.error('[SW] Activation error:', error)
      })
  )
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - Network First for API, Cache First for assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Handle different types of requests
  if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticAsset(event.request))
  } else if (isAPIRequest(event.request)) {
    event.respondWith(handleAPIRequest(event.request))
  } else {
    event.respondWith(handleDynamicRequest(event.request))
  }
})

// Helper functions to identify request types
function isStaticAsset(request) {
  return STATIC_ASSETS.some(asset => request.url.includes(asset))
}

function isAPIRequest(request) {
  return request.url.includes('/api/')
}

// Handle static asset requests
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse

    const networkResponse = await fetch(request)
    if (!networkResponse || networkResponse.status !== 200) {
      throw new Error('Failed to fetch')
    }

    const cache = await caches.open(STATIC_CACHE)
    await cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.error('[SW] Static asset fetch error:', error)
    return caches.match('/offline.html')
  }
}

// Handle API requests with caching and network-first strategy
async function handleAPIRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (!networkResponse || networkResponse.status !== 200) {
      throw new Error('Network response was not ok')
    }

    const cache = await caches.open(API_CACHE)
    await cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.error('[SW] API fetch error:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    throw error
  }
}

// Handle dynamic requests
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (!networkResponse || networkResponse.status !== 200) {
      throw new Error('Network response was not ok')
    }

    const cache = await caches.open(DYNAMIC_CACHE)
    await cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.error('[SW] Dynamic fetch error:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse
    return caches.match('/offline.html')
  }
}
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // API requests - Network First with cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/posts') || url.pathname.includes('/social')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] Serving API from cache:', request.url)
              return cachedResponse
            }
            return new Response(JSON.stringify({ error: 'Offline', cached: false }), {
              headers: { 'Content-Type': 'application/json' }
            })
          })
        })
    )
    return
  }

  // Static assets - Cache First with network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url)
          return cachedResponse
        }

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200) {
              return response
            }

            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })

            return response
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error)
            
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
            
            throw error
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data when connection is restored
      syncOfflineData()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New content available!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('CinemaFlix', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData()
    
    // Sync with server
    for (const item of offlineData) {
      try {
        await fetch(item.url, {
          method: item.method,
          body: item.body,
          headers: item.headers
        })
        
        // Remove from offline storage after successful sync
        await removeOfflineData(item.id)
      } catch (error) {
        console.error('[SW] Failed to sync offline data:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing offline data:', error)
  }
}

// Helper function to get offline data (placeholder)
async function getOfflineData() {
  // This would typically interact with IndexedDB
  return [];
}

// Import fetch handler
importScripts('/fetch-handler.js');

// Import fetch handler
importScripts('/fetch-handler.js');
}

// Helper function to remove offline data (placeholder)
async function removeOfflineData(id) {
  // This would typically interact with IndexedDB
  console.log('[SW] Removing offline data:', id)
}