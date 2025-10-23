import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Button } from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const PWAUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState(null)

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator) {
      // Listen for service worker updates
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              setWaitingWorker(newWorker)
              setShowUpdate(true)
              
              // Also show a toast notification
              toast.success('New version available!', {
                duration: 5000,
                icon: '🎉',
              })
            }
          })
        })
      })

      // Check for updates every 60 minutes
      setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update()
        })
      }, 60 * 60 * 1000)

      // Check for updates when page becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.update()
          })
        }
      })
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })

      // Listen for the controlling service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Reload the page to load the new version
        window.location.reload()
      })
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
  }

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl shadow-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">Update Available!</h3>
                  <p className="text-xs opacity-90">
                    A new version of CinemaFlix is ready
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Update
                </Button>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-white/50"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PWAUpdateNotification
