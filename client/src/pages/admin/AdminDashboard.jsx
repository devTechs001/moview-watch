import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Film, Users, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Star, BarChart3 } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 1247,
    totalUsers: 45231,
    totalRevenue: 892450,
    totalViews: 3456789,
    monthlyGrowth: 12.5,
    activeUsers: 23456,
  })

  const recentMovies = [
    { id: 1, title: 'Action Movie', views: 12453, rating: 8.5, status: 'active' },
    { id: 2, title: 'Comedy Film', views: 8932, rating: 7.8, status: 'active' },
    { id: 3, title: 'Drama Series', views: 15234, rating: 9.1, status: 'active' },
    { id: 4, title: 'Thriller Movie', views: 6543, rating: 8.2, status: 'pending' },
  ]

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', joined: '2 days ago', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joined: '3 days ago', status: 'active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', joined: '5 days ago', status: 'active' },
  ]

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Film className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+12%</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalMovies.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Movies</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+{stats.monthlyGrowth}%</span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+8%</span>
              </div>
              <div className="text-2xl font-bold mb-1">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-500" />
                </div>
                <span className="text-sm text-green-500 font-semibold">+15%</span>
              </div>
              <div className="text-2xl font-bold mb-1">{(stats.totalViews / 1000000).toFixed(1)}M</div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Movies */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Movies</CardTitle>
              <Link to="/admin/movies">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMovies.map((movie) => (
                  <div key={movie.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{movie.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{movie.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      movie.status === 'active' 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {movie.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Link to="/admin/users">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">{user.joined}</p>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/movies">
                <Button className="w-full" variant="outline">
                  <Film className="w-5 h-5 mr-2" />
                  Manage Movies
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button className="w-full" variant="outline">
                  <Users className="w-5 h-5 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Button className="w-full" variant="outline">
                <TrendingUp className="w-5 h-5 mr-2" />
                View Analytics
              </Button>
              <Link to="/theme">
                <Button className="w-full" variant="outline">
                  <Star className="w-5 h-5 mr-2" />
                  Theme Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
