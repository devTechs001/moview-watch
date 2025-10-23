import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Film, Users, Shield, Settings, MessageCircle, Download, BarChart3, FileText, Eye, Crown } from 'lucide-react'

const AdminSidebar = () => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const adminNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin', exact: true },
    { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Movies', icon: Film, path: '/admin/movies' },
    { name: 'Import Movies', icon: Download, path: '/admin/import-movies' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Subscriptions', icon: Crown, path: '/admin/subscriptions' },
    { name: 'AI Security', icon: Shield, path: '/admin/security' },
    { name: 'Comments', icon: MessageCircle, path: '/admin/comments' },
    { name: 'Reports', icon: FileText, path: '/admin/reports' },
    { name: 'Activity Log', icon: Eye, path: '/admin/activity' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ]

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border overflow-hidden z-30 flex flex-col">
      {/* Top Dynamic Section - Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4 px-3">
            Admin Panel
          </h2>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const active = item.exact
                ? location.pathname === item.path
                : isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Static Section - Fixed at bottom */}
      <div className="border-t border-border bg-card/95 backdrop-blur-sm">
        <div className="p-4">
          <Link
            to="/home"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">← Back to User View</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar
