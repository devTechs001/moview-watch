import Post from '../models/Post.js'
import Comment from '../models/Comment.js'
import SocialActivity from '../models/SocialActivity.js'

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, type, media, sharedMovie, rating, visibility } = req.body

    const post = await Post.create({
      user: req.user._id,
      content,
      type,
      media,
      sharedMovie,
      rating,
      visibility: visibility || 'public',
    })

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar')
      .populate('sharedMovie', 'title poster rating')

    // Create social activity (optional - don't fail if this fails)
    try {
      await SocialActivity.create({
        user: req.user._id,
        type: 'posted',
        visibility: visibility || 'public',
        metadata: { postId: post._id },
      })
    } catch (activityError) {
      console.warn('Social activity creation failed (non-critical):', activityError.message)
    }

    // Emit Socket.io event (optional)
    try {
      const io = req.app.get('io')
      if (io) {
        io.emit('new_post', populatedPost)
      }
    } catch (socketError) {
      console.warn('Socket.io emit failed (non-critical):', socketError.message)
    }

    res.status(201).json({ post: populatedPost })
  } catch (error) {
    console.error('Create post error:', error)
    res.status(500).json({ message: 'Failed to create post', error: error.message })
  }
}

// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, userId } = req.query

    const query = userId ? { user: userId } : { visibility: { $in: ['public', 'followers'] } }

    const posts = await Post.find(query)
      .populate('user', 'name avatar bio')
      .populate('sharedMovie', 'title poster rating genres')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name avatar' },
        options: { limit: 3, sort: { createdAt: -1 } },
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Post.countDocuments(query)

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    })
  } catch (error) {
    console.error('Get posts error:', error)
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message })
  }
}

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Private
export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar bio')
      .populate('sharedMovie', 'title poster rating genres cast')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'name avatar' },
      })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    res.json({ post })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch post', error: error.message })
  }
}

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' })
    }

    const { content, media, visibility } = req.body

    post.content = content || post.content
    post.media = media || post.media
    post.visibility = visibility || post.visibility
    post.isEdited = true
    post.editedAt = new Date()

    await post.save()

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'name avatar')
      .populate('sharedMovie', 'title poster rating')

    res.json({ post: updatedPost })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update post', error: error.message })
  }
}

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' })
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: req.params.id })

    await post.deleteOne()

    res.json({ message: 'Post deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete post', error: error.message })
  }
}

// @desc    Like/Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const alreadyLiked = post.likes.some(id => id.toString() === req.user._id.toString())

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      post.likes.push(req.user._id)

      // Create activity
      if (post.user.toString() !== req.user._id.toString()) {
        await SocialActivity.create({
          user: req.user._id,
          type: 'liked',
          targetUser: post.user,
          metadata: { postId: post._id },
        })
      }
    }

    await post.save()

    // Emit Socket.io event
    const io = req.app.get('io')
    io.emit('post_liked', {
      postId: post._id,
      userId: req.user._id,
      liked: !alreadyLiked,
      likeCount: post.likes.length,
    })

    res.json({ 
      likes: post.likes.length, 
      liked: !alreadyLiked 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to like post', error: error.message })
  }
}

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text,
      parentComment,
    })

    await comment.populate('user', 'name avatar')

    // Add comment to post
    post.comments.push(comment._id)
    await post.save()

    // If it's a reply, add to parent comment
    if (parentComment) {
      const parent = await Comment.findById(parentComment)
      if (parent) {
        parent.replies.push(comment._id)
        await parent.save()
      }
    }

    // Create activity
    if (post.user.toString() !== req.user._id.toString()) {
      await SocialActivity.create({
        user: req.user._id,
        type: 'commented',
        targetUser: post.user,
        metadata: { postId: post._id, commentId: comment._id },
      })
    }

    // Emit Socket.io event
    const io = req.app.get('io')
    io.emit('post_commented', {
      postId: post._id,
      comment,
      commentCount: post.comments.length,
    })

    res.status(201).json({ comment })
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ message: 'Failed to add comment', error: error.message })
  }
}

// @desc    Get post comments
// @route   GET /api/posts/:id/comments
// @access  Private
export const getComments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const comments = await Comment.find({ 
      post: req.params.id,
      parentComment: { $exists: false }
    })
      .populate('user', 'name avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'name avatar' },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Comment.countDocuments({ 
      post: req.params.id,
      parentComment: { $exists: false }
    })

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message })
  }
}

// @desc    Like/Unlike comment
// @route   POST /api/posts/comments/:commentId/like
// @access  Private
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const alreadyLiked = comment.likedBy.some(id => id.toString() === req.user._id.toString())

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== req.user._id.toString())
      comment.likes = Math.max(0, comment.likes - 1)
    } else {
      comment.likedBy.push(req.user._id)
      comment.likes += 1
    }

    await comment.save()

    res.json({ 
      likes: comment.likes, 
      liked: !alreadyLiked 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to like comment', error: error.message })
  }
}

// @desc    Delete comment
// @route   DELETE /api/posts/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' })
    }

    // Remove from post
    if (comment.post) {
      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: comment._id }
      })
    }

    // Remove from parent comment if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id }
      })
    }

    // Delete all replies
    await Comment.deleteMany({ parentComment: comment._id })

    await comment.deleteOne()

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error: error.message })
  }
}

// @desc    Share post
// @route   POST /api/posts/:id/share
// @access  Private
export const sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Add to shares
    post.shares.push({ user: req.user._id })
    await post.save()

    // Create activity
    if (post.user.toString() !== req.user._id.toString()) {
      await SocialActivity.create({
        user: req.user._id,
        type: 'shared',
        targetUser: post.user,
        metadata: { postId: post._id },
      })
    }

    // Emit Socket.io event
    const io = req.app.get('io')
    io.emit('post_shared', {
      postId: post._id,
      userId: req.user._id,
      shareCount: post.shares.length,
    })

    res.json({ 
      shares: post.shares.length,
      message: 'Post shared successfully' 
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to share post', error: error.message })
  }
}

// @desc    Pin/Unpin post (user's own posts only)
// @route   POST /api/posts/:id/pin
// @access  Private
export const pinPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only pin your own posts' })
    }

    post.isPinned = !post.isPinned
    await post.save()

    res.json({ 
      isPinned: post.isPinned,
      message: post.isPinned ? 'Post pinned' : 'Post unpinned'
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to pin post', error: error.message })
  }
}
