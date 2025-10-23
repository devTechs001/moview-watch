import express from 'express'
import { protect } from '../middleware/auth.js'
import FriendRequest from '../models/FriendRequest.js'
import User from '../models/User.js'

const router = express.Router()

// Send friend request
router.post('/request/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params
    const { message } = req.body

    const existing = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id }
      ]
    })

    if (existing) {
      return res.status(400).json({ message: 'Friend request already exists' })
    }

    const request = await FriendRequest.create({
      from: req.user._id,
      to: userId,
      message,
    })

    const populated = await FriendRequest.findById(request._id)
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')

    res.status(201).json({ request: populated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Accept friend request
router.put('/request/:id/accept', protect, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.id)
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    if (request.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    request.status = 'accepted'
    await request.save()
    
    await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } })
    await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } })
    
    res.json({ request })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Reject friend request
router.put('/request/:id/reject', protect, async (req, res) => {
  try {
    const request = await FriendRequest.findById(req.params.id)
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' })
    }

    request.status = 'rejected'
    await request.save()
    
    res.json({ request })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get friend requests
router.get('/requests', protect, async (req, res) => {
  try {
    const requests = await FriendRequest.find({ 
      to: req.user._id, 
      status: 'pending' 
    }).populate('from', 'name avatar bio')

    res.json({ requests })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get friends list
router.get('/list', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name avatar bio')
    
    res.json({ friends: user.friends || [] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Remove friend
router.delete('/:friendId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: req.params.friendId } })
    await User.findByIdAndUpdate(req.params.friendId, { $pull: { friends: req.user._id } })
    
    res.json({ message: 'Friend removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
