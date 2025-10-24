import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Users, MessageCircle, User, Film, Heart, Settings, Shield, Palette, UserPlus, TrendingUp, MessagesSquare, Bell, Bookmark, Clock, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { SOCKET_URL } from '../lib/utils'
import { io } from 'socket.io-client'

const MobileNav = () => {
  const location = useLocation()
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState(0)
  const [messages, setMessages] = useState(0)
  const [socket, setSocket] = useState(null)

  // Initialize socket connection for real-time updates
  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // Listen for real-time notifications
    newSocket.on('notification', (data) => {
      setNotifications(prev => prev + 1)
    })

    newSocket.on('new_message', (data) => {
      setMessages(prev => prev + 1)
    })

    return () => newSocket.disconnect()
  }, [])

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const mainNavItems = [
    { name: 'Home', icon: Home, path: '/home', color: 'text-blue-500' },
    { name: 'Search', icon: Search, path: '/search', color: 'text-green-500' },
    { name: 'Movies', icon: Film, path: '/movies', color: 'text-purple-500' },
    { name: 'Social', icon: Users, path: '/social', color: 'text-pink-500', badge: notifications },
  ]

  const secondaryNavItems = [
    { name: 'Friends', icon: UserPlus, path: '/friends', color: 'text-orange-500' },
    { name: 'Stories', icon: TrendingUp, path: '/stories', color: 'text-yellow-500' },
    { name: 'Chat', icon: MessageCircle, path: '/chat', color: 'text-indigo-500', badge: messages },
    { name: 'Rooms', icon: MessagesSquare, path: '/chatrooms', color: 'text-teal-500' },
  ]

  const adminNavItems = user?.role === 'admin' ? [
    { name: 'Admin', icon: Shield, path: '/admin' },
  ] : []

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border lg:hidden z-40">
      <nav className="flex items-center justify-between px-2">
        {/* Main Navigation Items */}
        <div className="flex items-center gap-1">
          {mainNavItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className={`relative flex flex-col items-center gap-1 py-3 px-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-all ${
                    isActive(item.path) 
                      ? 'fill-primary/20 scale-110' 
                      : 'hover:scale-110'
                  }`} />
                  
                  {/* Badge for notifications */}
                  {item.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.div>
                  )}
                </div>
                
                <span className="text-xs font-medium">{item.name}</span>
                
                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Secondary Navigation Items */}
        <div className="flex items-center gap-1">
          {secondaryNavItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={item.path}
                className={`relative flex flex-col items-center gap-1 py-3 px-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'text-primary bg-primary/10 shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-all ${
                    isActive(item.path) 
                      ? 'fill-primary/20 scale-110' 
                      : 'hover:scale-110'
                  }`} />
                  
                  {/* Badge for messages */}
                  {item.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.div>
                  )}
                </div>
                
                <span className="text-xs font-medium">{item.name}</span>
                
                {/* Active indicator */}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </Link>
            </motion.div>
          ))}

          {/* Admin Link */}
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-3 px-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'fill-primary/20' : ''}`} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Additional Quick Actions */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2 px-4">
          <Link
            to="/profile"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${
              isActive('/profile')
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Link>
          <Link
            to="/wishlist"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${
              isActive('/wishlist')
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Wishlist</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${
              isActive('/settings')
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MobileNav
