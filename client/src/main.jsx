import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { register as registerServiceWorker } from './utils/serviceWorkerRegistration'

// Initialize theme
const theme = localStorage.getItem('theme') || 'dark'
if (theme === 'dark') {
  document.documentElement.classList.add('dark')
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
