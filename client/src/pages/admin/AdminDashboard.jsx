import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Film, Users, TrendingUp, DollarSign, Eye, Heart, MessageCircle, Star, BarChart3, RefreshCw } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import axios from '../../lib/axios'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../../lib/utils'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalViews: 0,
    userGrowth: 0,
    activeUsers: 0,
    totalComments: 0,
    totalPosts: 0,
    activeMovies: 0,
    pendingMovies: 0,
    monthlyRevenue: 0,
  })
  const [recentMovies, setRecentMovies] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentComments, setRecentComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    fetchStats()
    
    // Setup Socket.IO for real-time updates
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // Join admin room
    newSocket.emit('join-admin', 'admin')

    // Listen for real-time updates
    newSocket.on('stats_updated', (data) => {
      setStats(prev => ({ ...prev, ...data }))
    })

    newSocket.on('new_user_registered', () => {
      fetchStats() // Refresh stats when new user registers
    })

    newSocket.on('new_post', () => {
      fetchStats()
    })

    newSocket.on('movie_liked', () => {
      fetchStats()
    })

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => {
      newSocket.disconnect()
      clearInterval(interval)
    }
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/stats')
      setStats(response.data.stats)
      setRecentMovies(response.data.recentMovies || [])
      setRecentUsers(response.data.recentUsers || [])
      setRecentComments(response.data.recentComments || [])
    } catch (error) {
      console.error('Fetch stats error:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diff = Math.floor((now - then) / 1000) // seconds

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

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
                <span className={`text-sm font-semibold ${stats.userGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth}%
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Users ({stats.activeUsers} active)</p>
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
                {recentMovies.length > 0 ? recentMovies.map((movie) => (
                  <div key={movie._id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{movie.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {movie.views?.toLocaleString() || 0} views • {formatDate(movie.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-semibold">{movie.rating || 0}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        movie.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {movie.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No recent movies</p>
                )}
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
                {recentUsers.length > 0 ? recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span>
                      <span className={`w-2 h-2 rounded-full ${
                        user.isActive ? 'bg-green-500' : 'bg-gray-500'
                      }`}></span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-4">No recent users</p>
                )}
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
