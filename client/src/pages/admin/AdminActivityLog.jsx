import { useState, useEffect } from 'react'
import { Eye, User, Film, MessageCircle, Heart, Trash2, Edit, Shield, LogIn, LogOut } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar'
import axios from '../../lib/axios'
import { formatDate, getInitials } from '../../lib/utils'

const AdminActivityLog = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, user, admin, system

  useEffect(() => {
    fetchActivities()
  }, [filter])

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`/admin/activity?type=${filter}`)
      setActivities(response.data.activities || generateDemoActivities())
    } catch (error) {
      console.error(error)
      setActivities(generateDemoActivities())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoActivities = () => {
    return [
      {
        _id: '1',
        type: 'user_login',
        user: { name: 'John Doe', avatar: '', role: 'user' },
        action: 'logged in',
        details: 'IP: 192.168.1.1',
        createdAt: new Date(),
      },
      {
        _id: '2',
        type: 'movie_added',
        user: { name: 'Admin User', avatar: '', role: 'admin' },
        action: 'added a movie',
        details: 'Movie: The Matrix',
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        _id: '3',
        type: 'user_registered',
        user: { name: 'Jane Smith', avatar: '', role: 'user' },
        action: 'registered',
        details: 'Email: jane@example.com',
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        _id: '4',
        type: 'comment_deleted',
        user: { name: 'Moderator', avatar: '', role: 'admin' },
        action: 'deleted a comment',
        details: 'Reason: Spam',
        createdAt: new Date(Date.now() - 10800000),
      },
      {
        _id: '5',
        type: 'security_alert',
        user: { name: 'System', avatar: '', role: 'system' },
        action: 'detected suspicious activity',
        details: 'Multiple failed login attempts',
        createdAt: new Date(Date.now() - 14400000),
      },
    ]
  }

  const getActivityIcon = (type) => {
    const icons = {
      user_login: <LogIn className="w-5 h-5 text-green-500" />,
      user_logout: <LogOut className="w-5 h-5 text-gray-500" />,
      user_registered: <User className="w-5 h-5 text-blue-500" />,
      movie_added: <Film className="w-5 h-5 text-purple-500" />,
      movie_edited: <Edit className="w-5 h-5 text-orange-500" />,
      movie_deleted: <Trash2 className="w-5 h-5 text-red-500" />,
      comment_added: <MessageCircle className="w-5 h-5 text-cyan-500" />,
      comment_deleted: <Trash2 className="w-5 h-5 text-red-500" />,
      post_liked: <Heart className="w-5 h-5 text-pink-500" />,
      security_alert: <Shield className="w-5 h-5 text-red-500" />,
      system: <Eye className="w-5 h-5 text-gray-500" />,
    }
    return icons[type] || icons.system
  }

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'destructive',
      user: 'default',
      system: 'secondary',
    }
    return <Badge variant={variants[role]}>{role}</Badge>
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Activity Log</h1>
            <p className="text-muted-foreground">Monitor all system activities</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'user' ? 'default' : 'outline'}
              onClick={() => setFilter('user')}
            >
              User
            </Button>
            <Button
              variant={filter === 'admin' ? 'default' : 'outline'}
              onClick={() => setFilter('admin')}
            >
              Admin
            </Button>
            <Button
              variant={filter === 'system' ? 'default' : 'outline'}
              onClick={() => setFilter('system')}
            >
              System
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {activities.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <User className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {activities.filter(a => a.user?.role === 'user').length}
              </div>
              <p className="text-sm text-muted-foreground">User Actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {activities.filter(a => a.user?.role === 'admin').length}
              </div>
              <p className="text-sm text-muted-foreground">Admin Actions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {activities.filter(a => a.user?.role === 'system').length}
              </div>
              <p className="text-sm text-muted-foreground">System Events</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.user?.avatar} />
                      <AvatarFallback>{getInitials(activity.user?.name || 'S')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{activity.user?.name}</span>
                        {getRoleBadge(activity.user?.role)}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{activity.details}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminActivityLog
