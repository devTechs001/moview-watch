import { useState, useEffect } from 'react'
import { Heart, Share2, Bookmark, Eye, MessageCircle, ThumbsUp, Smile, MoreHorizontal } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { getInitials, SOCKET_URL } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import axios from '../lib/axios'

const REACTIONS = [
  { emoji: '❤️', name: 'love', icon: Heart, color: 'text-red-500' },
  { emoji: '👍', name: 'like', icon: ThumbsUp, color: 'text-blue-500' },
  { emoji: '😂', name: 'laugh', icon: null, color: 'text-yellow-500' },
  { emoji: '😮', name: 'wow', icon: null, color: 'text-purple-500' },
  { emoji: '😢', name: 'sad', icon: null, color: 'text-gray-500' },
  { emoji: '😡', name: 'angry', icon: null, color: 'text-orange-500' },
]

const EnhancedLikeShare = ({ post, currentUser, onLike, onShare, onComment, onBookmark }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [showReactions, setShowReactions] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // Listen for real-time updates
    newSocket.on('post_liked', (data) => {
      if (data.postId === post._id) {
        setLikeCount(data.likeCount)
        setIsLiked(data.liked)
        if (data.liked) {
          triggerLikeAnimation()
        }
      }
    })

    newSocket.on('post_shared', (data) => {
      if (data.postId === post._id) {
        setShareCount(data.shareCount)
        triggerShareAnimation()
      }
    })

    newSocket.on('post_commented', (data) => {
      if (data.postId === post._id) {
        setCommentCount(data.commentCount)
      }
    })

    newSocket.on('post_viewed', (data) => {
      if (data.postId === post._id) {
        setViewCount(data.viewCount)
      }
    })

    return () => newSocket.disconnect()
  }, [post._id])

  // Initialize state from post data
  useEffect(() => {
    setIsLiked(post.likes?.includes(currentUser?._id) || false)
    setIsBookmarked(post.bookmarks?.includes(currentUser?._id) || false)
    setLikeCount(post.likeCount || post.likes?.length || 0)
    setShareCount(post.shareCount || post.shares?.length || 0)
    setCommentCount(post.commentCount || post.comments?.length || 0)
    setViewCount(post.viewCount || post.views?.length || 0)
    
    // Track view on mount
    handleView()
  }, [post, currentUser])

  const triggerLikeAnimation = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1000)
  }

  const triggerShareAnimation = () => {
    toast.success('Post shared!', { icon: '🚀' })
  }

  const handleLike = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/like`)
      setIsLiked(response.data.liked)
      setLikeCount(response.data.likeCount)
      
      if (response.data.liked) {
        triggerLikeAnimation()
        toast.success('Liked!', { icon: '❤️' })
      } else {
        toast('Unliked', { icon: '💔' })
      }
    } catch (error) {
      toast.error('Failed to like post')
    }
  }

  const handleReaction = async (reactionType) => {
    try {
      await axios.post(`/posts/${post._id}/react`, { type: reactionType })
      setShowReactions(false)
      toast.success(`Reacted with ${reactionType}!`, { icon: '😊' })
    } catch (error) {
      toast.error('Failed to react')
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${post._id}`
    const shareText = `Check out this post: ${post.content?.substring(0, 100) || 'Interesting content'}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Share Post',
          text: shareText,
          url: shareUrl,
        })
        
        // Track share on backend
        await axios.post(`/posts/${post._id}/share`)
        setShareCount(prev => prev + 1)
        triggerShareAnimation()
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
        
        // Track share on backend
        await axios.post(`/posts/${post._id}/share`)
        setShareCount(prev => prev + 1)
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share post')
      }
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await axios.post(`/posts/${post._id}/bookmark`)
      setIsBookmarked(response.data.bookmarked)
      
      if (response.data.bookmarked) {
        toast.success('Bookmarked!', { icon: '🔖' })
      } else {
        toast('Removed from bookmarks', { icon: '📖' })
      }
    } catch (error) {
      toast.error('Failed to bookmark post')
    }
  }

  const handleView = async () => {
    try {
      await axios.post(`/posts/${post._id}/view`)
      setViewCount(prev => prev + 1)
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  return (
    <div className="space-y-3">
      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
        <div className="flex items-center gap-4">
          {likeCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {REACTIONS.slice(0, 3).map((reaction, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center text-xs"
                  >
                    {reaction.emoji}
                  </div>
                ))}
              </div>
              <span className="font-medium">{likeCount}</span>
            </div>
          )}
          
          {commentCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{commentCount}</span>
            </div>
          )}
          
          {shareCount > 0 && (
            <div className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span className="font-medium">{shareCount}</span>
            </div>
          )}
        </div>
        
        {viewCount > 0 && (
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span className="font-medium">{viewCount}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex items-center gap-1">
          {/* Like Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' 
                  : 'hover:bg-secondary'
              }`}
            >
              <motion.div
                animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 transition-all ${isLiked ? 'fill-red-500' : ''}`} />
              </motion.div>
              <span className="hidden sm:inline">Like</span>
            </Button>

            {/* Reactions Popup */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-card border-2 border-primary/20 rounded-full px-3 py-2 shadow-xl flex gap-2 z-20"
                >
                  {REACTIONS.map((reaction) => (
                    <motion.button
                      key={reaction.name}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(reaction.name)}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                      title={reaction.name}
                    >
                      {reaction.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Comment Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onComment}
            className="flex items-center gap-2 hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Comment</span>
          </Button>

          {/* Share Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 hover:bg-secondary transition-colors group"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1">
          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`flex items-center gap-2 transition-all duration-200 ${
              isBookmarked 
                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20' 
                : 'hover:bg-secondary'
            }`}
          >
            <Bookmark className={`w-5 h-5 transition-all ${isBookmarked ? 'fill-yellow-500' : ''}`} />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* More Options */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReactions(!showReactions)}
            className="hover:bg-secondary transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

    </div>
  )
}

export default EnhancedLikeShare
