import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      toast.success('App installed successfully!')
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed or dismissed
  if (isInstalled || localStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  // iOS Instructions
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 z-50 border border-gray-200 dark:border-gray-700">
        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Install Our App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Add to your home screen for a better experience!
            </p>

            <div className="space-y-2 text-sm">
              <p className="font-semibold">How to install:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li>Tap the Share button <span className="inline-block">⬆️</span></li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop Install Button
  if (deferredPrompt && showPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 z-50 border border-gray-200 dark:border-gray-700">
        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Monitor className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Install Our App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Get quick access and work offline!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition"
              >
                <Download className="w-4 h-4" />
                Install
              </button>

              <button
                onClick={dismissPrompt}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
