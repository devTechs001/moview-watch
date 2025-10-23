import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Components
import SplashScreen from './components/SplashScreen'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import ThemeProvider from './components/ThemeProvider'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import PWAUpdateNotification from './components/PWAUpdateNotification'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/HomePage'
import MovieDetails from './pages/MovieDetails'
import WatchMovie from './pages/WatchMovie'
import SearchPage from './pages/SearchPage'
import WishlistPage from './pages/WishlistPage'
import ProfilePage from './pages/ProfilePage'
import EnhancedProfilePage from './pages/EnhancedProfilePage'
import SettingsPage from './pages/SettingsPage'
import ChatPage from './pages/ChatPage'
import SocialFeed from './pages/SocialFeed'
import EnhancedSocialFeed from './pages/EnhancedSocialFeed'
import StoriesPage from './pages/StoriesPage'
import TrendingPage from './pages/TrendingPage'
import MoviesPage from './pages/MoviesPage'
import WatchLaterPage from './pages/WatchLaterPage'
import HistoryPage from './pages/HistoryPage'
import SubscriptionPage from './pages/SubscriptionPage'
import BillingPage from './pages/BillingPage'
import ChatroomsPage from './pages/ChatroomsPage'
import ChatroomView from './pages/ChatroomView'
import PaymentPage from './pages/PaymentPage'
import InvitePage from './pages/InvitePage'
import FriendsPage from './pages/FriendsPage'
import SubscriptionCheckout from './pages/SubscriptionCheckout'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminUsers from './pages/admin/AdminUsers'
import AdminSettings from './pages/admin/AdminSettings'
import AISecurityDashboard from './pages/admin/AISecurityDashboard'
import TMDBImporter from './pages/admin/TMDBImporter'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSubscriptions from './pages/admin/AdminSubscriptions'
import EnhancedThemeSelector from './pages/admin/EnhancedThemeSelector'
import AdminReports from './pages/admin/AdminReports'
import AdminActivityLog from './pages/admin/AdminActivityLog'
import AdminComments from './pages/admin/AdminComments'
import ThemeDebugPage from './pages/ThemeDebugPage'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const { checkAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Check authentication status
    checkAuth()

    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [checkAuth])

  if (showSplash) {
    return <SplashScreen />
  }

  return (
    <ThemeProvider>
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/home" /> : <RegisterPage />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/movie/:id" element={
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        } />
        <Route path="/watch/:id" element={
          <ProtectedRoute>
            <WatchMovie />
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <EnhancedProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <EnhancedProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/social" element={
          <ProtectedRoute>
            <EnhancedSocialFeed />
          </ProtectedRoute>
        } />
        <Route path="/social-old" element={
          <ProtectedRoute>
            <SocialFeed />
          </ProtectedRoute>
        } />
        <Route path="/stories" element={
          <ProtectedRoute>
            <StoriesPage />
          </ProtectedRoute>
        } />
        <Route path="/trending" element={
          <ProtectedRoute>
            <TrendingPage />
          </ProtectedRoute>
        } />
        <Route path="/movies" element={
          <ProtectedRoute>
            <MoviesPage />
          </ProtectedRoute>
        } />
        <Route path="/watch-later" element={
          <ProtectedRoute>
            <WatchLaterPage />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <SubscriptionCheckout />
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        } />
        <Route path="/chatrooms" element={
          <ProtectedRoute>
            <ChatroomsPage />
          </ProtectedRoute>
        } />
        <Route path="/chatroom/:roomId" element={
          <ProtectedRoute>
            <ChatroomView />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path="/invite/:code" element={<InvitePage />} />
        <Route path="/friends" element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/movies" element={
          <AdminRoute>
            <AdminMovies />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } />
        <Route path="/admin/security" element={
          <AdminRoute>
            <AISecurityDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/import-movies" element={
          <AdminRoute>
            <TMDBImporter />
          </AdminRoute>
        } />
        <Route path="/admin/subscriptions" element={
          <AdminRoute>
            <AdminSubscriptions />
          </AdminRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        } />
        <Route path="/admin/activity" element={
          <AdminRoute>
            <AdminActivityLog />
          </AdminRoute>
        } />
        <Route path="/admin/comments" element={
          <AdminRoute>
            <AdminComments />
          </AdminRoute>
        } />

        {/* User Theme Settings */}
        <Route path="/theme" element={
          <ProtectedRoute>
            <EnhancedThemeSelector />
          </ProtectedRoute>
        } />
        
        {/* Theme Debug Page */}
        <Route path="/theme-debug" element={
          <ProtectedRoute>
            <ThemeDebugPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
