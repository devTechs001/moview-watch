import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Film, Heart, Users, MessageCircle, Settings, User, TrendingUp, Compass, Bookmark, Clock, LayoutDashboard, Shield, Crown, CreditCard, Palette, MessagesSquare, UserPlus, LogOut, Bell, Zap, Video, Music, Sparkles, Download } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { getInitials } from '../lib/utils'

const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const userNavItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Discover', icon: Compass, path: '/search' },
    { name: 'Trending', icon: TrendingUp, path: '/trending' },
    { name: 'Movies', icon: Film, path: '/movies' },
    { name: 'Shorts', icon: Video, path: '/shorts' },
    { name: 'Music', icon: Music, path: '/music' },
    { name: 'Animations', icon: Sparkles, path: '/animations' },
    { name: 'Wishlist', icon: Heart, path: '/wishlist' },
    { name: 'Watch Later', icon: Bookmark, path: '/watch-later' },
    { name: 'History', icon: Clock, path: '/history' },
    { name: 'Downloads', icon: Download, path: '/downloads' },
  ]

  const socialNavItems = [
    { name: 'Social Feed', icon: Users, path: '/social' },
    { name: 'Stories', icon: TrendingUp, path: '/stories' },
    { name: 'Friends', icon: UserPlus, path: '/friends' },
    { name: 'Messages', icon: MessageCircle, path: '/chat' },
    { name: 'Chatrooms', icon: MessagesSquare, path: '/chatrooms' },
  ]

  const accountNavItems = [
    { name: 'Subscription', icon: Crown, path: '/subscription' },
    { name: 'Billing', icon: CreditCard, path: '/billing' },
    { name: 'Theme', icon: Palette, path: '/theme' },
  ]

  const adminNavItems = user?.role === 'admin' ? [
    { name: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'AI Security', icon: Shield, path: '/admin/security' },
  ] : []

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border overflow-hidden z-30 hidden lg:flex flex-col">
      {/* Top Dynamic Section - Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 mb-8">
            <Film className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CinemaFlix
            </span>
          </Link>

          {/* Main Navigation */}
          <nav className="space-y-1 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Menu</p>
            {userNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Social Navigation */}
          <nav className="space-y-1 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Social</p>
            {socialNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Account Navigation */}
          <nav className="space-y-1 mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Account</p>
            {accountNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Admin Navigation */}
          {adminNavItems.length > 0 && (
            <nav className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">Admin</p>
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Bottom Static Section - Fixed at bottom */}
      <div className="border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="p-6">
          {/* User Profile */}
          <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent mb-4 transition-colors">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive('/settings')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
