import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Users, MessageCircle, User } from 'lucide-react'

const MobileNav = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Search', icon: Search, path: '/search' },
    { name: 'Social', icon: Users, path: '/social' },
    { name: 'Chat', icon: MessageCircle, path: '/chat' },
    { name: 'Profile', icon: User, path: '/profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border lg:hidden z-40">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 py-3 px-4 flex-1 ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <item.icon className={`w-6 h-6 ${isActive(item.path) ? 'fill-primary/20' : ''}`} />
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default MobileNav
