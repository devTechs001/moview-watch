import Comment from '../models/Comment.js'

// @desc    Get comments for a movie
// @route   GET /api/comments/:movieId
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ movie: req.params.movieId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })

    res.json({ comments })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create comment
// @route   POST /api/comments/:movieId
// @access  Private
export const createComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      movie: req.params.movieId,
      user: req.user._id,
      text: req.body.text,
    })

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name avatar'
    )

    res.status(201).json({ comment: populatedComment })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await comment.deleteOne()

    res.json({ message: 'Comment removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like comment
// @route   PUT /api/comments/:id/like
// @access  Private
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const alreadyLiked = comment.likedBy.includes(req.user._id)

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== req.user._id.toString()
      )
      comment.likes -= 1
    } else {
      comment.likedBy.push(req.user._id)
      comment.likes += 1
    }

    await comment.save()

    res.json({ likes: comment.likes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
