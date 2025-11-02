import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Environment configuration for different deployments
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Auto-detect deployment environment
  if (window.location.hostname.includes('netlify.app')) {
    return 'https://cinemaflx-server.onrender.com'
  }

  if (window.location.hostname.includes('github.io')) {
    return 'https://cinemaflx-server.onrender.com'
  }

  // Local development
  return 'http://localhost:5000'
}

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }
  
  // Auto-detect deployment environment
  if (window.location.hostname.includes('netlify.app')) {
    return 'https://cinemaflx-server.onrender.com'
  }
  
  if (window.location.hostname.includes('github.io')) {
    return 'https://cinemaflx-server.onrender.com'
  }
  
  // Local development
  return 'http://localhost:5000'
}

export const API_URL = getApiUrl()
export const SOCKET_URL = getSocketUrl()

// Format duration in minutes to hours and minutes
export function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

// Format number to K, M notation
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Format date
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get initials from name
export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
