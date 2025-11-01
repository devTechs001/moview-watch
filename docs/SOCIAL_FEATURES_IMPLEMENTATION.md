# 🚀 Complete Social Features Implementation Guide

## ✅ Issues Fixed

### 1. **MongoDB Connection in createAdmin.js** ✅
- Fixed to use fallback to local MongoDB
- Added proper .env path loading
- Now works without MONGODB_URI set

### 2. **Post Creation 500 Error** ✅
**Cause**: Post model requires either content, media, or sharedMovie

**Solution**: Ensure at least one field is provided when creating posts

```javascript
// Minimum required for post creation
{
  content: "Your post text" // OR
  media: ["image_url"] // OR
  sharedMovie: movieId
}
```

---

## 🎯 New Features to Implement

### **1. Profile Views Tracking**

#### Add to User Model (`/server/models/User.js`):
```javascript
profileViews: [{
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  anonymous: {
    type: Boolean,
    default: false,
  }
}],
profileViewCount: {
  type: Number,
  default: 0,
},
```

#### Create ProfileView Model (`/server/models/ProfileView.js`):
```javascript
import mongoose from 'mongoose'

const profileViewSchema = new mongoose.Schema({
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
})

// Index for faster queries
profileViewSchema.index({ profile: 1, createdAt: -1 })
profileViewSchema.index({ viewer: 1, profile: 1 })

const ProfileView = mongoose.model('ProfileView', profileViewSchema)
export default ProfileView
```

---

### **2. Friend Request System** (Already exists but needs controller)

#### Friend Request Controller (`/server/controllers/friendController.js`):
```javascript
import FriendRequest from '../models/FriendRequest.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'

// @desc    Send friend request
// @route   POST /api/friends/request/:userId
// @access  Private
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params
    const { message } = req.body

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      from: req.user._id,
      to: userId,
    })

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' })
    }

    // Check if already friends
    const user = await User.findById(req.user._id)
    if (user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends' })
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      from: req.user._id,
      to: userId,
      message,
    })

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')

    // Create notification
    await Notification.create({
      user: userId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user.name} sent you a friend request`,
      link: `/profile/${req.user._id}`,
      metadata: { requestId: friendRequest._id },
    })

    // Emit Socket.IO event
    const io = req.app.get('io')
    if (io) {
      io.to(userId.toString()).emit('friend_request', populatedRequest)
    }

    res.status(201).json({ friendRequest: populatedRequest })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Accept friend request
// @route   PUT /api/friends/request/:requestId/accept
// @access  Private
export const acceptFriendRequest = async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findById(req.params.requestId)

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' })
    }

    if (friendRequest.to.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Update request status
    friendRequest.status = 'accepted'
    await friendRequest.save()

    // Add to friends lists
    await User.findByIdAndUpdate(friendRequest.from, {
      $addToSet: { friends: friendRequest.to },
    })

    await User.findByIdAndUpdate(friendRequest.to, {
      $addToSet: { friends: friendRequest.from },
    })

    // Create notification
    await Notification.create({
      user: friendRequest.from,
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: `${req.user.name} accepted your friend request`,
      link: `/profile/${req.user._id}`,
    })

    // Emit Socket.IO event
    const io = req.app.get('io')
    if (io) {
      io.to(friendRequest.from.toString()).emit('friend_accepted', {
        userId: req.user._id,
        userName: req.user.name,
      })
    }

    res.json({ message: 'Friend request accepted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Reject friend request
// @route   PUT /api/friends/request/:requestId/reject
// @access  Private
export const rejectFriendRequest = async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findById(req.params.requestId)

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' })
    }

    if (friendRequest.to.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    friendRequest.status = 'rejected'
    await friendRequest.save()

    res.json({ message: 'Friend request rejected' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get friend requests
// @route   GET /api/friends/requests
// @access  Private
export const getFriendRequests = async (req, res) => {
  try {
    const { type = 'received' } = req.query

    const query = {
      [type === 'received' ? 'to' : 'from']: req.user._id,
      status: 'pending',
    }

    const requests = await FriendRequest.find(query)
      .populate('from', 'name avatar bio')
      .populate('to', 'name avatar bio')
      .sort({ createdAt: -1 })

    res.json({ requests })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get friends list
// @route   GET /api/friends
// @access  Private
export const getFriends = async (req, res) => {
  try {
    const { userId, type = 'all' } = req.query
    const targetUserId = userId || req.user._id

    const user = await User.findById(targetUserId)
      .populate('friends', 'name avatar bio location')
      .populate('followers', 'name avatar bio')
      .populate('following', 'name avatar bio')

    let friends = []

    switch (type) {
      case 'friends':
        friends = user.friends
        break
      case 'followers':
        friends = user.followers
        break
      case 'following':
        friends = user.following
        break
      case 'all':
      default:
        friends = user.friends
        break
    }

    res.json({ friends, count: friends.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Remove friend
// @route   DELETE /api/friends/:userId
// @access  Private
export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params

    // Remove from both users' friends lists
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { friends: userId },
    })

    await User.findByIdAndUpdate(userId, {
      $pull: { friends: req.user._id },
    })

    res.json({ message: 'Friend removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
}
```

---

### **3. Profile Views Controller** (`/server/controllers/profileController.js`):
```javascript
import User from '../models/User.js'
import ProfileView from '../models/ProfileView.js'

// @desc    Track profile view
// @route   POST /api/profile/:userId/view
// @access  Private/Public
export const trackProfileView = async (req, res) => {
  try {
    const { userId } = req.params
    const viewerId = req.user?._id

    // Don't track own profile views
    if (viewerId && viewerId.toString() === userId) {
      return res.json({ message: 'Own profile view not tracked' })
    }

    // Create profile view
    await ProfileView.create({
      profile: userId,
      viewer: viewerId,
      anonymous: !viewerId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    })

    // Update profile view count
    await User.findByIdAndUpdate(userId, {
      $inc: { profileViewCount: 1 },
    })

    // Emit Socket.IO event
    const io = req.app.get('io')
    if (io && viewerId) {
      io.to(userId).emit('profile_viewed', {
        viewer: viewerId,
        viewerName: req.user.name,
      })
    }

    res.json({ message: 'Profile view tracked' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get profile views
// @route   GET /api/profile/views
// @access  Private
export const getProfileViews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const views = await ProfileView.find({ profile: req.user._id })
      .populate('viewer', 'name avatar bio')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const count = await ProfileView.countDocuments({ profile: req.user._id })

    res.json({
      views,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/profile/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
      .select('-password')
      .populate('friends', 'name avatar')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check privacy settings
    if (user.preferences.privacy.profileVisibility === 'private' && 
        req.user?._id.toString() !== userId) {
      return res.status(403).json({ message: 'Profile is private' })
    }

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body

    // Don't allow updating certain fields
    delete updates.email
    delete updates.password
    delete updates.role

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({ user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  trackProfileView,
  getProfileViews,
  getUserProfile,
  updateProfile,
}
```

---

### **4. Private Chat System** (Using existing DirectMessage model)

#### Chat Controller Enhancement (`/server/controllers/chatController.js`):
```javascript
import DirectMessage from '../models/DirectMessage.js'
import User from '../models/User.js'

// @desc    Send private message
// @route   POST /api/chat/private/:userId
// @access  Private
export const sendPrivateMessage = async (req, res) => {
  try {
    const { userId } = req.params
    const { message, media } = req.body

    // Check if users are friends
    const user = await User.findById(req.user._id)
    if (!user.friends.includes(userId)) {
      return res.status(403).json({ message: 'Can only message friends' })
    }

    const directMessage = await DirectMessage.create({
      sender: req.user._id,
      recipient: userId,
      message,
      media,
    })

    const populatedMessage = await DirectMessage.findById(directMessage._id)
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')

    // Emit Socket.IO event
    const io = req.app.get('io')
    if (io) {
      io.to(userId.toString()).emit('private_message', populatedMessage)
    }

    res.status(201).json({ message: populatedMessage })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get private chat history
// @route   GET /api/chat/private/:userId
// @access  Private
export const getPrivateChat = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 50 } = req.query

    const messages = await DirectMessage.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('recipient', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Mark messages as read
    await DirectMessage.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        read: false,
      },
      { read: true }
    )

    res.json({ messages: messages.reverse() })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get chat list
// @route   GET /api/chat/list
// @access  Private
export const getChatList = async (req, res) => {
  try {
    // Get all users with whom current user has chatted
    const messages = await DirectMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$recipient',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    // Populate user details
    const chatList = await User.populate(messages, {
      path: '_id',
      select: 'name avatar bio',
    })

    res.json({ chats: chatList })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  sendPrivateMessage,
  getPrivateChat,
  getChatList,
}
```

---

## 📡 Socket.IO Events to Add

Add to `/server/server.js`:

```javascript
// Friend requests
socket.on('send_friend_request', (data) => {
  io.to(data.recipientId).emit('friend_request_received', data)
})

// Profile views
socket.on('profile_viewed', (data) => {
  io.to(data.profileId).emit('new_profile_view', data)
})

// Private messages
socket.on('private_message', (data) => {
  io.to(data.recipientId).emit('receive_private_message', data)
})

// Typing indicators for private chat
socket.on('typing_private', (data) => {
  io.to(data.recipientId).emit('user_typing_private', {
    userId: socket.userId,
    chatId: data.chatId,
  })
})

// Online status
socket.on('user_online', (userId) => {
  // Broadcast to user's friends
  io.emit('friend_online', { userId })
})

socket.on('user_offline', (userId) => {
  io.emit('friend_offline', { userId })
})
```

---

## 🛣️ Routes to Add

### Friend Routes (`/server/routes/friendRoutes.js`):
```javascript
import express from 'express'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
} from '../controllers/friendController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/request/:userId', protect, sendFriendRequest)
router.put('/request/:requestId/accept', protect, acceptFriendRequest)
router.put('/request/:requestId/reject', protect, rejectFriendRequest)
router.get('/requests', protect, getFriendRequests)
router.get('/', protect, getFriends)
router.delete('/:userId', protect, removeFriend)

export default router
```

### Profile Routes (`/server/routes/profileRoutes.js`):
```javascript
import express from 'express'
import {
  trackProfileView,
  getProfileViews,
  getUserProfile,
  updateProfile,
} from '../controllers/profileController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/:userId/view', trackProfileView)
router.get('/views', protect, getProfileViews)
router.get('/:userId', getUserProfile)
router.put('/', protect, updateProfile)

export default router
```

---

## 🎨 Frontend Components Needed

### 1. **FriendRequestButton.jsx**
```jsx
import { useState } from 'react'
import { Button } from './ui/Button'
import { UserPlus, UserCheck, Clock } from 'lucide-react'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

export default function FriendRequestButton({ userId, initialStatus }) {
  const [status, setStatus] = useState(initialStatus) // 'none', 'pending', 'friends'

  const sendRequest = async () => {
    try {
      await axios.post(`/friends/request/${userId}`)
      setStatus('pending')
      toast.success('Friend request sent!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request')
    }
  }

  const removeFriend = async () => {
    try {
      await axios.delete(`/friends/${userId}`)
      setStatus('none')
      toast.success('Friend removed')
    } catch (error) {
      toast.error('Failed to remove friend')
    }
  }

  if (status === 'friends') {
    return (
      <Button variant="outline" onClick={removeFriend}>
        <UserCheck className="w-4 h-4 mr-2" />
        Friends
      </Button>
    )
  }

  if (status === 'pending') {
    return (
      <Button variant="outline" disabled>
        <Clock className="w-4 h-4 mr-2" />
        Request Sent
      </Button>
    )
  }

  return (
    <Button onClick={sendRequest}>
      <UserPlus className="w-4 h-4 mr-2" />
      Add Friend
    </Button>
  )
}
```

### 2. **ProfileViews.jsx**
```jsx
import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar'
import axios from '../lib/axios'

export default function ProfileViews() {
  const [views, setViews] = useState([])

  useEffect(() => {
    fetchViews()
  }, [])

  const fetchViews = async () => {
    try {
      const { data } = await axios.get('/profile/views')
      setViews(data.views)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Profile Views ({views.length})
      </h3>
      <div className="space-y-2">
        {views.map((view) => (
          <div key={view._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary">
            <Avatar>
              <AvatarImage src={view.viewer?.avatar} />
              <AvatarFallback>{view.viewer?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{view.viewer?.name || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(view.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 3. **PrivateChat.jsx**
```jsx
import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import axios from '../lib/axios'
import { io } from 'socket.io-client'

export default function PrivateChat({ userId, userName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    newSocket.on('receive_private_message', (message) => {
      if (message.sender._id === userId) {
        setMessages(prev => [...prev, message])
      }
    })

    return () => newSocket.disconnect()
  }, [userId])

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`/chat/private/${userId}`)
      setMessages(data.messages)
    } catch (error) {
      console.error(error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const { data } = await axios.post(`/chat/private/${userId}`, {
        message: newMessage
      })
      setMessages([...messages, data.message])
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender._id === userId ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[70%] rounded-lg p-3 ${
              msg.sender._id === userId ? 'bg-secondary' : 'bg-primary text-primary-foreground'
            }`}>
              <p>{msg.message}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

## ✅ Summary

### **Fixed**:
1. ✅ MongoDB connection in createAdmin.js
2. ✅ Post creation error (validation issue)

### **To Implement**:
1. ✅ Friend Request System (models exist, need controllers)
2. ✅ Profile Views Tracking
3. ✅ Private Chat Enhancement
4. ✅ Friends Lists (public/private/all)
5. ✅ Real-time updates for all features

### **Files to Create**:
- `/server/models/ProfileView.js`
- `/server/controllers/friendController.js`
- `/server/controllers/profileController.js`
- `/server/routes/profileRoutes.js`
- Frontend components (FriendRequestButton, ProfileViews, PrivateChat)

### **Files to Update**:
- `/server/models/User.js` - Add profileViews fields
- `/server/server.js` - Add new Socket.IO events
- `/server/server.js` - Add profile routes

All code is provided above and ready to implement!
