import { useState } from 'react'
import { Heart, MessageCircle, Send, Smile, MoreVertical, Reply, ThumbsUp, Laugh, Angry, Sad, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { getInitials, formatDate } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const REACTIONS = [
  { emoji: '❤️', name: 'love', icon: Heart, color: 'text-red-500' },
  { emoji: '👍', name: 'like', icon: ThumbsUp, color: 'text-blue-500' },
  { emoji: '😂', name: 'laugh', icon: Laugh, color: 'text-yellow-500' },
  { emoji: '😮', name: 'wow', icon: null, color: 'text-purple-500' },
  { emoji: '😢', name: 'sad', icon: Sad, color: 'text-gray-500' },
  { emoji: '😡', name: 'angry', icon: Angry, color: 'text-orange-500' },
]

const EMOJIS = [
  '😀', '😂', '🥰', '😍', '🤩', '😎', '🔥', '💯', '❤️', '👍',
  '🎬', '🍿', '⭐', '✨', '🎉', '🎊', '👏', '🙌', '💪', '🎵'
]

const Comment = ({ comment, currentUser, onReply, onReact, onDelete, level = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReactions, setShowReactions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleReply = async () => {
    if (!replyText.trim()) return
    await onReply(comment._id, replyText)
    setReplyText('')
    setShowReplyInput(false)
  }

  const handleReact = async (reaction) => {
    await onReact(comment._id, reaction)
    setShowReactions(false)
  }

  const addEmoji = (emoji) => {
    setReplyText(replyText + emoji)
  }

  const isOwnComment = currentUser?._id === comment.user?._id

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-12 mt-3' : 'mt-4'}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-border">
          <AvatarImage src={comment.user?.avatar} />
          <AvatarFallback className="bg-gradient-primary text-white text-sm">
            {getInitials(comment.user?.name || 'U')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          <div className="bg-secondary/50 rounded-2xl rounded-tl-none px-4 py-3 inline-block max-w-full">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-sm">{comment.user?.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-foreground break-words">{comment.text}</p>
          </div>

          {/* Reactions Display */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex items-center gap-1 mt-1 ml-2">
              {Object.entries(
                comment.reactions.reduce((acc, r) => {
                  acc[r.type] = (acc[r.type] || 0) + 1
                  return acc
                }, {})
              ).map(([type, count]) => {
                const reaction = REACTIONS.find(r => r.name === type)
                return (
                  <div
                    key={type}
                    className="flex items-center gap-1 px-2 py-1 bg-background rounded-full text-xs border"
                  >
                    <span>{reaction?.emoji}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-2 ml-2">
            <div className="relative">
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                React
              </button>

              {/* Reactions Popup */}
              {showReactions && (
                <AnimatePresence>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute bottom-full left-0 mb-2 bg-card border-2 border-primary/20 rounded-full px-2 py-1 shadow-xl flex gap-1 z-10"
                  >
                    {REACTIONS.map((reaction) => (
                      <button
                        key={reaction.name}
                        onClick={() => handleReact(reaction.name)}
                        className="text-2xl hover:scale-125 transition-transform p-1"
                        title={reaction.name}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>

            {isOwnComment && (
              <button
                onClick={() => onDelete(comment._id)}
                className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3"
            >
              <div className="flex items-start gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {getInitials(currentUser?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${comment.user?.name}...`}
                    className="pr-20"
                    onKeyPress={(e) => e.key === 'Enter' && handleReply()}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <Smile className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="p-1 hover:bg-primary hover:text-primary-foreground rounded disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Emoji Picker for Reply */}
                  {showEmojiPicker && (
                    <div className="absolute top-full mt-2 right-0 bg-card border-2 border-border rounded-xl p-3 shadow-xl z-20 grid grid-cols-10 gap-2 max-w-xs">
                      {EMOJIS.map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <Comment
                  key={reply._id}
                  comment={reply}
                  currentUser={currentUser}
                  onReply={onReply}
                  onReact={onReact}
                  onDelete={onDelete}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const EnhancedComments = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [sortBy, setSortBy] = useState('recent') // recent, popular, oldest

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/posts/${postId}/comments`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setLoading(true)
      const response = await axios.post(`/posts/${postId}/comments`, {
        text: newComment,
      })

      setComments([response.data.comment, ...comments])
      setNewComment('')
      toast.success('Comment added!')
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (commentId, text) => {
    try {
      const response = await axios.post(`/posts/${postId}/comments/${commentId}/reply`, {
        text,
      })

      // Update comments with new reply
      setComments(comments.map(c => 
        c._id === commentId 
          ? { ...c, replies: [...(c.replies || []), response.data.reply] }
          : c
      ))
      toast.success('Reply added!')
    } catch (error) {
      toast.error('Failed to add reply')
    }
  }

  const handleReact = async (commentId, reactionType) => {
    try {
      await axios.post(`/posts/comments/${commentId}/react`, {
        type: reactionType,
      })

      // Update local state
      setComments(comments.map(c => {
        if (c._id === commentId) {
          const reactions = c.reactions || []
          return {
            ...c,
            reactions: [...reactions, { type: reactionType, user: currentUser._id }]
          }
        }
        return c
      }))
    } catch (error) {
      toast.error('Failed to react')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return

    try {
      await axios.delete(`/posts/comments/${commentId}`)
      setComments(comments.filter(c => c._id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const addEmoji = (emoji) => {
    setNewComment(newComment + emoji)
  }

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'popular') return (b.reactions?.length || 0) - (a.reactions?.length || 0)
    return 0
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments ({comments.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1 bg-background"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Add Comment */}
      <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-xl">
        <Avatar className="w-10 h-10 ring-2 ring-border">
          <AvatarImage src={currentUser?.avatar} />
          <AvatarFallback className="bg-gradient-primary text-white">
            {getInitials(currentUser?.name || 'U')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="pr-20"
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:bg-secondary rounded"
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="p-1 hover:bg-primary hover:text-primary-foreground rounded disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute top-full mt-2 right-0 bg-card border-2 border-primary/20 rounded-xl p-4 shadow-2xl z-20 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm">Emojis</span>
                <button onClick={() => setShowEmojiPicker(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-10 gap-2">
                {EMOJIS.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-secondary rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-2">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              onReply={handleReply}
              onReact={handleReact}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default EnhancedComments
