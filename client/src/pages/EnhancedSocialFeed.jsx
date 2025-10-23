import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, Send, MoreVertical, Image as ImageIcon, Video, X, Repeat2 } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import MediaUpload from '../components/MediaUpload'
import PostOptions from '../components/PostOptions'
import axios from '../lib/axios'
import { useAuthStore } from '../store/authStore'
import { getInitials, formatDate } from '../lib/utils'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

const EnhancedSocialFeed = () => {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [socket, setSocket] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)

  useEffect(() => {
    fetchPosts()
    
    // Setup Socket.io
    const newSocket = io('http://localhost:5000')
    setSocket(newSocket)

    // Listen for real-time updates
    newSocket.on('new_post', (post) => {
      setPosts(prev => [post, ...prev])
    })

    newSocket.on('post_liked', ({ postId, likeCount }) => {
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, likeCount, likes: Array(likeCount).fill(null) } : p
      ))
    })

    newSocket.on('post_commented', ({ postId, comment, commentCount }) => {
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, commentCount, comments: [comment, ...p.comments] } : p
      ))
    })

    newSocket.on('post_shared', ({ postId, shareCount }) => {
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, shareCount } : p
      ))
    })

    return () => newSocket.disconnect()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/posts?page=${page}&limit=10`)
      setPosts(prev => page === 1 ? response.data.posts : [...prev, ...response.data.posts])
      setHasMore(response.data.currentPage < response.data.totalPages)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPostContent.trim() && !selectedMedia) return

    try {
      const formData = new FormData()
      formData.append('content', newPostContent)
      formData.append('visibility', 'public')
      
      if (selectedMedia) {
        formData.append('media', selectedMedia)
        formData.append('type', selectedMedia.type.startsWith('image/') ? 'image' : 'video')
      } else {
        formData.append('type', 'text')
      }

      const response = await axios.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setPosts([response.data.post, ...posts])
      setNewPostContent('')
      setSelectedMedia(null)
      setMediaPreview(null)
      toast.success('Post created!')
    } catch (error) {
      toast.error('Failed to create post')
    }
  }

  const handleMediaSelect = (file, type) => {
    setSelectedMedia(file)
    setMediaPreview(URL.createObjectURL(file))
    setShowMediaUpload(false)
    toast.success(`${type === 'image' ? 'Photo' : 'Video'} added!`)
  }

  const removeMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview)
    }
    setSelectedMedia(null)
    setMediaPreview(null)
  }

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(`/posts/${postId}/like`)
      
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const newLikes = response.data.liked 
            ? [...(p.likes || []), user._id]
            : (p.likes || []).filter(id => id !== user._id)
          return { ...p, likes: newLikes, likeCount: response.data.likes }
        }
        return p
      }))
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleSharePost = async (postId) => {
    const post = posts.find(p => p._id === postId)
    const shareUrl = `${window.location.origin}/post/${postId}`
    const shareText = `Check out this post: ${post?.content?.substring(0, 100) || 'Interesting content'}`

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Post',
          text: shareText,
          url: shareUrl,
        })
        
        // Track share on backend
        await axios.post(`/posts/${postId}/share`)
        toast.success('Post shared!')
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied to clipboard!')
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
      
      // Track share on backend
      try {
        await axios.post(`/posts/${postId}/share`)
      } catch (error) {
        console.error('Share tracking failed:', error)
      }
    }
  }

  const handleEditPost = (post) => {
    setNewPostContent(post.content)
    toast('Edit feature coming soon!', { icon: '✏️' })
  }

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p._id !== postId))
      toast.success('Post deleted!')
    } catch (error) {
      toast.error('Failed to delete post')
    }
  }

  const handleReportPost = async (postId, reason) => {
    try {
      await axios.post(`/posts/${postId}/report`, { reason })
      toast.success('Post reported. We\'ll review it shortly.')
    } catch (error) {
      toast.error('Failed to report post')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Social Feed</h1>
          <p className="text-muted-foreground">Connect with movie lovers around the world</p>
        </div>

        {/* Create Post */}
        <Card elevated className="mb-6 sticky top-20 z-10 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
              </Avatar>
              <form onSubmit={handleCreatePost} className="flex-1">
                <textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="mb-3 w-full min-h-[100px] p-4 rounded-lg border-2 border-input bg-background text-sm resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                />
                
                {/* Media Preview */}
                {mediaPreview && (
                  <div className="mb-3 relative">
                    {selectedMedia?.type.startsWith('image/') ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        controls 
                        className="w-full max-h-64 rounded-lg"
                      />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeMedia}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-primary/10 hover:text-primary"
                      onClick={() => setShowMediaUpload(true)}
                    >
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Photo/Video
                    </Button>
                    {selectedMedia && (
                      <span className="text-sm text-primary font-medium">
                        ✓ Media attached
                      </span>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!newPostContent.trim()}
                    className="min-w-[100px]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={user}
              onLike={handleLikePost}
              onShare={handleSharePost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onReport={handleReportPost}
            />
          ))}

          {posts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground">Be the first to share something!</p>
              </CardContent>
            </Card>
          )}

          {hasMore && (
            <Button 
              onClick={() => {
                setPage(p => p + 1)
                fetchPosts()
              }}
              className="w-full"
              variant="outline"
            >
              Load More
            </Button>
          )}
        </div>
      </div>
      
      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUpload 
          onMediaSelect={handleMediaSelect}
          onClose={() => setShowMediaUpload(false)}
        />
      )}
    </Layout>
  )
}

const PostCard = ({ post, currentUser, onLike, onShare, onEdit, onDelete, onReport }) => {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.comments || [])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(
    post.likes?.includes(currentUser?._id) || false
  )

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await axios.post(`/posts/${post._id}/comments`, {
        text: newComment,
      })

      setComments([response.data.comment, ...comments])
      setNewComment('')
      toast.success('Comment added!')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike(post._id)
  }

  return (
    <Card elevated interactive className="hover-lift">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.user?.avatar} />
              <AvatarFallback>{getInitials(post.user?.name || 'U')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </div>
          <PostOptions
            post={post}
            currentUser={currentUser}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
          />
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="whitespace-pre-wrap text-base leading-relaxed">{post.content}</p>
          {post.sharedMovie && (
            <Card className="mt-4 border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <CardContent className="p-4 flex gap-4">
                <img
                  src={post.sharedMovie.poster}
                  alt={post.sharedMovie.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <h4 className="font-semibold">{post.sharedMovie.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Rating: {post.sharedMovie.rating}/10
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Post Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4 pb-4 border-b border-border/50">
          <button className="hover:underline transition-colors">
            <span className="font-semibold text-foreground">{post.likeCount || post.likes?.length || 0}</span> likes
          </button>
          <button className="hover:underline transition-colors">
            <span className="font-semibold text-foreground">{post.commentCount || comments.length}</span> comments
          </button>
          <button className="hover:underline transition-colors">
            <span className="font-semibold text-foreground">{post.shareCount || post.shares?.length || 0}</span> shares
          </button>
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-1 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex-1 transition-all duration-200 ${isLiked ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' : 'hover:bg-secondary'}`}
          >
            <Heart className={`w-5 h-5 mr-2 transition-transform ${isLiked ? 'fill-red-500 scale-110' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1 hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Comment
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onShare(post._id)}
            className="flex-1 hover:bg-secondary transition-colors group"
          >
            <Share2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-border/50 pt-4 animate-in slide-in-from-top-2 duration-200">
            {/* Add Comment */}
            <form onSubmit={handleAddComment} className="flex items-center gap-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback>{getInitials(currentUser?.name || 'U')}</AvatarFallback>
              </Avatar>
              <Input
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newComment.trim()}
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.slice(0, 3).map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback>{getInitials(comment.user?.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-secondary/50 hover:bg-secondary/80 rounded-xl p-3 transition-colors">
                    <p className="font-semibold text-sm">{comment.user?.name}</p>
                    <p className="text-sm">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {comments.length > 3 && (
                <Button variant="link" size="sm">
                  View all {comments.length} comments
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default EnhancedSocialFeed
