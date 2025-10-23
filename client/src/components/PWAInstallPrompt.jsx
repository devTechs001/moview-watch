import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor } from 'lucide-react'
import { Button } from './ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running as PWA
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      (document.referrer && document.referrer.includes('android-app://'))

    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = localStorage.getItem('pwa-install-dismissed-time')
    
    // Show again after 7 days
    if (dismissed && dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        return
      }
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        if (!isInStandaloneMode) {
          setShowPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show prompt after delay if not standalone
    if (iOS && !isInStandaloneMode && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return

    if (deferredPrompt) {
      // Android/Desktop installation
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString())
  }

  // Don't show if already installed or dismissed
  if (isStandalone || !showPrompt) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-card border-2 border-primary/20 rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
                {isIOS ? (
                  <Smartphone className="w-6 h-6 text-white" />
                ) : (
                  <Download className="w-6 h-6 text-white" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Install CinemaFlix
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isIOS
                    ? 'Install our app for the best experience'
                    : 'Get quick access and offline features'}
                </p>

                {isIOS ? (
                  // iOS Instructions
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">To install:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Tap the Share button <span className="inline-block">⎙</span></li>
                      <li>Scroll down and tap "Add to Home Screen"</li>
                      <li>Tap "Add" in the top right</li>
                    </ol>
                  </div>
                ) : (
                  // Android/Desktop Install Button
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInstallClick}
                      className="flex-1"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install Now
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                    >
                      Later
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Offline Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Fast Loading</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Push Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>Full Screen</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PWAInstallPrompt
