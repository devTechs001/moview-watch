import { useState, useEffect } from 'react'
import { MessageCircle, Trash2, Flag, Check, X, Search, Film } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar'
import axios from '../../lib/axios'
import toast from 'react-hot-toast'
import { getInitials, formatDate } from '../../lib/utils'

const AdminComments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, flagged, approved
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    flagged: 0,
    approved: 0,
  })

  useEffect(() => {
    fetchComments()
    fetchStats()
  }, [filter])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/admin/comments?filter=${filter}`)
      setComments(response.data.comments || [])
    } catch (error) {
      // Mock data for development
      setComments([
        {
          _id: '1',
          text: 'Great movie! Loved the cinematography.',
          user: { name: 'John Doe', avatar: '', email: 'john@example.com' },
          post: { _id: 'p1', content: 'Just watched this amazing film!' },
          movie: { title: 'Inception' },
          isFlagged: false,
          createdAt: new Date(),
        },
        {
          _id: '2',
          text: 'This is spam content',
          user: { name: 'Spammer', avatar: '', email: 'spam@example.com' },
          post: { _id: 'p2', content: 'Check out my post' },
          movie: { title: 'The Matrix' },
          isFlagged: true,
          createdAt: new Date(Date.now() - 3600000),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/comments/stats')
      setStats(response.data.stats)
    } catch (error) {
      setStats({ total: 2, flagged: 1, approved: 1 })
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await axios.delete(`/admin/comments/${commentId}`)
      setComments(comments.filter(c => c._id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleFlagComment = async (commentId) => {
    try {
      await axios.put(`/admin/comments/${commentId}/flag`)
      setComments(comments.map(c => 
        c._id === commentId ? { ...c, isFlagged: !c.isFlagged } : c
      ))
      toast.success('Comment flagged')
    } catch (error) {
      toast.error('Failed to flag comment')
    }
  }

  const handleApproveComment = async (commentId) => {
    try {
      await axios.put(`/admin/comments/${commentId}/approve`)
      setComments(comments.map(c => 
        c._id === commentId ? { ...c, isFlagged: false } : c
      ))
      toast.success('Comment approved')
    } catch (error) {
      toast.error('Failed to approve comment')
    }
  }

  const filteredComments = comments.filter(comment =>
    comment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Comments Management</h1>
        <p className="text-muted-foreground text-lg">Moderate and manage user comments across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Comments</p>
                <p className="text-4xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-full">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-destructive bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Flagged</p>
                <p className="text-4xl font-bold text-destructive">{stats.flagged}</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-full">
                <Flag className="w-8 h-8 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Approved</p>
                <p className="text-4xl font-bold text-green-500">{stats.approved}</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-full">
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="shadow-md">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className="min-w-[100px]"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                All
              </Button>
              <Button
                variant={filter === 'flagged' ? 'default' : 'outline'}
                onClick={() => setFilter('flagged')}
                className="min-w-[100px]"
              >
                <Flag className="w-4 h-4 mr-2" />
                Flagged
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
                className="min-w-[100px]"
              >
                <Check className="w-4 h-4 mr-2" />
                Approved
              </Button>
            </div>

            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search comments by text or user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        ) : filteredComments.length === 0 ? (
          <Card elevated>
            <CardContent className="p-16 text-center">
              <div className="p-6 bg-secondary/50 rounded-full w-fit mx-auto mb-6">
                <MessageCircle className="w-20 h-20 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No Comments Found</h3>
              <p className="text-muted-foreground text-lg">
                {searchQuery ? 'Try a different search term' : 'No comments to display'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card
              key={comment._id}
              className={`hover:shadow-lg transition-all duration-300 ${
                comment.isFlagged 
                  ? 'border-l-4 border-l-destructive bg-destructive/5 dark:bg-destructive/10' 
                  : 'border-l-4 border-l-transparent hover:border-l-primary hover:shadow-primary/10'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12 ring-2 ring-border">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {getInitials(comment.user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3 gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate">{comment.user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                      {comment.isFlagged && (
                        <span className="badge bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold flex items-center gap-1 shrink-0">
                          <Flag className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-4 mb-3">
                      <p className="text-foreground leading-relaxed">{comment.text}</p>
                    </div>

                    {comment.movie && (
                      <div className="flex items-center gap-2 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <Film className="w-4 h-4 text-primary" />
                        <p className="text-sm">
                          On movie: <span className="font-bold text-primary">{comment.movie.title}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {comment.isFlagged ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveComment(comment._id)}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 dark:bg-green-950/20 dark:hover:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFlagComment(comment._id)}
                          className="hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300 dark:hover:bg-yellow-950/20 dark:hover:text-yellow-400"
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Flag
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteComment(comment._id)}
                        className="shadow-sm hover:shadow-md"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
    </AdminLayout>
  )
}

export default AdminComments
