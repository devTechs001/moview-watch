import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Users, MessageCircle, User, Film, Heart, Settings, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const MobileNav = () => {
  const location = useLocation()
  const { user } = useAuthStore()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const mainNavItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Movies', icon: Film, path: '/movies' },
    { name: 'Social', icon: Users, path: '/social' },
  ]

  const secondaryNavItems = [
    { name: 'Chat', icon: MessageCircle, path: '/chat' },
    { name: 'Profile', icon: User, path: '/profile' },
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

        {/* Secondary Navigation Items */}
        <div className="flex items-center gap-1">
          {secondaryNavItems.map((item) => (
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

      {/* Additional Quick Actions (Optional) */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-center py-2">
          <Link
            to="/settings"
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs transition-colors ${
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
