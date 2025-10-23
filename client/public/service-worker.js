/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'cinemaflix-v1.0.0'
const RUNTIME_CACHE = 'cinemaflix-runtime'

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching assets')
      return cache.addAll(PRECACHE_URLS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline.html')
          })
        })
    )
    return
  }

  // Static assets - Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Cache new assets
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
      })
    })
  )
})

// Background Sync - for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag)
  
  if (event.tag === 'sync-likes') {
    event.waitUntil(syncLikes())
  } else if (event.tag === 'sync-comments') {
    event.waitUntil(syncComments())
  }
})

async function syncLikes() {
  // Get pending likes from IndexedDB and sync with server
  console.log('[Service Worker] Syncing likes...')
}

async function syncComments() {
  // Get pending comments from IndexedDB and sync with server
  console.log('[Service Worker] Syncing comments...')
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received')
  
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'CinemaFlix'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Close' }
    ],
    requireInteraction: data.requireInteraction || false,
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'open') {
    const urlToOpen = event.notification.data.url || '/'
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Focus existing window if available
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

// Message handler for app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Periodic background sync (for auto-updates)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates())
  }
})

async function checkForUpdates() {
  console.log('[Service Worker] Checking for updates...')
  // Check if new version is available
  // Notify user via push notification
}
