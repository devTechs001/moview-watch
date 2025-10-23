import { Link, useNavigate } from 'react-router-dom'
import { Film, Search, User, LogOut, Settings, Heart, MessageCircle, LayoutDashboard, Moon, Sun, Users, Shield } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { Button } from './ui/Button'
import { getInitials } from '../lib/utils'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 text-2xl font-bold group">
            <div className="relative">
              <Film className="w-8 h-8 text-primary transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all"></div>
            </div>
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              CinemaFlix
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border-2 border-input bg-background/50 backdrop-blur-sm text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50 hover:bg-background"
                onFocus={() => navigate('/search')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/wishlist')}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/chat')}
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/social')}
              aria-label="Social Feed"
            >
              <Users className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 outline-none">
                  <Avatar className="w-9 h-9 cursor-pointer border-2 border-primary">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[200px] bg-card rounded-md border shadow-lg p-1"
                  sideOffset={5}
                  align="end"
                >
                  <div className="px-3 py-2 border-b">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>

                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded outline-none"
                        onSelect={() => navigate('/admin')}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Dashboard
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded outline-none"
                        onSelect={() => navigate('/admin/security')}
                      >
                        <Shield className="w-4 h-4" />
                        AI Security
                      </DropdownMenu.Item>
                    </>
                  )}

                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded outline-none"
                    onSelect={() => navigate('/profile')}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </DropdownMenu.Item>

                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded outline-none"
                    onSelect={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-border my-1" />

                  <DropdownMenu.Item
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded outline-none text-destructive"
                    onSelect={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
