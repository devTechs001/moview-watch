import Notification from '../models/Notification.js'

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type, category } = req.query

    const query = { user: req.user._id }
    if (isRead !== undefined) query.isRead = isRead === 'true'
    if (type) query.type = type
    if (category) query.category = category

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    })

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      unreadCount,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message })
  }
}

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    })

    res.json({ count })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch count', error: error.message })
  }
}

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    notification.isRead = true
    notification.readAt = new Date()
    await notification.save()

    res.json({ notification })
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read', error: error.message })
  }
}

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all as read', error: error.message })
  }
}

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await notification.deleteOne()

    res.json({ message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message })
  }
}

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id })

    res.json({ message: 'All notifications deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notifications', error: error.message })
  }
}

// Create notification (admin only)
export const createNotification = async (req, res) => {
  try {
    const { users, type, title, message, priority, category, link, actions } = req.body

    const notifications = []

    for (const userId of users) {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        priority,
        category,
        link,
        actions,
        sender: req.user._id,
      })
      notifications.push(notification)
    }

    // Emit Socket.io event for real-time notifications
    const io = req.app.get('io')
    for (const notif of notifications) {
      io.to(notif.user.toString()).emit('new_notification', notif)
    }

    res.status(201).json({
      notifications,
      message: `${notifications.length} notification(s) created`,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create notification', error: error.message })
  }
}

// Send broadcast notification (admin only)
export const broadcastNotification = async (req, res) => {
  try {
    const { type, title, message, priority, category, link, userRole } = req.body

    // Get users based on role
    let users
    if (userRole) {
      users = await User.find({ role: userRole }).select('_id')
    } else {
      users = await User.find().select('_id')
    }

    const notifications = []
    for (const user of users) {
      const notification = await Notification.create({
        user: user._id,
        type,
        title,
        message,
        priority,
        category,
        link,
        sender: req.user._id,
      })
      notifications.push(notification)
    }

    // Emit Socket.io event
    const io = req.app.get('io')
    io.emit('broadcast_notification', {
      type,
      title,
      message,
      priority,
    })

    res.status(201).json({
      message: `Broadcast sent to ${notifications.length} users`,
      count: notifications.length,
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to broadcast notification', error: error.message })
  }
}

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  broadcastNotification,
}
