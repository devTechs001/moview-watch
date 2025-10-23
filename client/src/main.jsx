import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { register as registerServiceWorker } from './utils/serviceWorkerRegistration'
import { useThemeStore } from './store/themeStore'

// Initialize theme system immediately to prevent flash
if (typeof window !== 'undefined') {
  // Apply theme class immediately from localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark'
  const themeStore = useThemeStore.getState()
  const themeData = themeStore.themes[savedTheme]
  
  // Determine if theme is dark
  const isDarkTheme = savedTheme === 'dark' || 
                     (themeData && parseInt(themeData.background.slice(1), 16) < 0x808080)
  
  if (isDarkTheme) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Initialize full theme
  useThemeStore.getState().init()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker()
}
