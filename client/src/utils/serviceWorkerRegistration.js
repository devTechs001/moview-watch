// Service Worker Registration for PWA

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `/service-worker.js`

      registerValidSW(swUrl)
    })
  }
}

async function registerValidSW(swUrl) {
  try {
    const registration = await navigator.serviceWorker.register(swUrl)
    
    console.log('[PWA] Service Worker registered:', registration)

    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[PWA] New content available! Please refresh.')
          
          // Show update notification
          showUpdateNotification()
        }
      })
    })

    // Check for updates every hour
    setInterval(() => {
      registration.update()
    }, 60 * 60 * 1000)

  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error)
  }
}

function showUpdateNotification() {
  // Create custom notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Update Available', {
      body: 'A new version of CinemaFlix is available. Refresh to update!',
      icon: '/icons/icon-192x192.png',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        { action: 'refresh', title: 'Refresh Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    })
  }

  // Also show in-app notification
  const event = new CustomEvent('sw-update-available')
  window.dispatchEvent(event)
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}

// Request notification permission
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

// Subscribe to push notifications
export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
    })

    // Send subscription to server
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    })

    console.log('[PWA] Push subscription successful')
    return subscription

  } catch (error) {
    console.error('[PWA] Push subscription failed:', error)
    return null
  }
}

// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Check if app can be installed
export function canInstallPWA() {
  let deferredPrompt = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })

  return {
    isInstallable: () => deferredPrompt !== null,
    install: async () => {
      if (!deferredPrompt) return false

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      deferredPrompt = null
      
      return outcome === 'accepted'
    }
  }
}

export default {
  register,
  unregister,
  requestNotificationPermission,
  subscribeToPush,
  canInstallPWA,
}
