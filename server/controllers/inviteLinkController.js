import InviteLink from '../models/InviteLink.js'
import Chatroom from '../models/Chatroom.js'
import Movie from '../models/Movie.js'
import User from '../models/User.js'

// Create invite link
export const createInviteLink = async (req, res) => {
  try {
    const { type, targetId, maxUses, expiresIn, permissions, metadata } = req.body

    // Verify target exists
    let target
    let targetType
    
    if (type === 'chatroom') {
      target = await Chatroom.findById(targetId)
      targetType = 'Chatroom'
      
      // Check if user is admin/moderator of chatroom
      const member = target?.members.find(m => m.user.toString() === req.user._id.toString())
      if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
        return res.status(403).json({ message: 'Only admins/moderators can create invite links' })
      }
    } else if (type === 'movie') {
      target = await Movie.findById(targetId)
      targetType = 'Movie'
    }

    if (!target) {
      return res.status(404).json({ message: `${type} not found` })
    }

    // Calculate expiration
    let expiresAt = null
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000) // hours to ms
    }

    const inviteLink = await InviteLink.create({
      type,
      createdBy: req.user._id,
      targetId,
      targetType,
      maxUses,
      expiresAt,
      permissions,
      metadata: metadata || {
        title: target.name || target.title,
        description: target.description || `Join ${target.name || target.title}`,
        thumbnail: target.avatar || target.poster,
      },
    })

    await inviteLink.populate('createdBy', 'name avatar')

    res.status(201).json({
      inviteLink,
      inviteUrl: inviteLink.getInviteUrl(process.env.CLIENT_URL),
    })
  } catch (error) {
    console.error('Create invite link error:', error)
    res.status(500).json({ message: 'Failed to create invite link', error: error.message })
  }
}

// Get invite link details (public)
export const getInviteLinkDetails = async (req, res) => {
  try {
    const { code } = req.params

    const inviteLink = await InviteLink.findOne({ code })
      .populate('createdBy', 'name avatar')
      .populate('targetId')

    if (!inviteLink) {
      return res.status(404).json({ message: 'Invite link not found' })
    }

    if (!inviteLink.isValid()) {
      return res.status(400).json({ 
        message: 'Invite link has expired or reached maximum uses',
        expired: true,
      })
    }

    res.json({
      inviteLink: {
        code: inviteLink.code,
        type: inviteLink.type,
        createdBy: inviteLink.createdBy,
        metadata: inviteLink.metadata,
        maxUses: inviteLink.maxUses,
        usedCount: inviteLink.usedCount,
        expiresAt: inviteLink.expiresAt,
        target: inviteLink.targetId,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invite link', error: error.message })
  }
}

// Use invite link (join/accept)
export const useInviteLink = async (req, res) => {
  try {
    const { code } = req.params
    const ipAddress = req.ip || req.connection.remoteAddress

    const inviteLink = await InviteLink.findOne({ code })
      .populate('targetId')

    if (!inviteLink) {
      return res.status(404).json({ message: 'Invite link not found' })
    }

    if (!inviteLink.isValid()) {
      return res.status(400).json({ 
        message: 'Invite link has expired or reached maximum uses',
      })
    }

    // Check if user already used this link
    const alreadyUsed = inviteLink.usedBy.some(
      u => u.user && u.user.toString() === req.user._id.toString()
    )

    let result = {}

    // Process based on type
    if (inviteLink.type === 'chatroom') {
      const chatroom = await Chatroom.findById(inviteLink.targetId)
      
      if (!chatroom) {
        return res.status(404).json({ message: 'Chatroom not found' })
      }

      // Check if already a member
      const isMember = chatroom.members.some(
        m => m.user.toString() === req.user._id.toString()
      )

      if (!isMember) {
        // Add user to chatroom
        chatroom.members.push({
          user: req.user._id,
          role: inviteLink.permissions?.role || 'member',
        })
        await chatroom.save()

        // Increment link usage
        if (!alreadyUsed) {
          await inviteLink.use(req.user._id, ipAddress)
        }

        // Emit Socket.io event
        const io = req.app.get('io')
        io.to(chatroom._id.toString()).emit('member_joined', {
          chatroomId: chatroom._id,
          user: {
            _id: req.user._id,
            name: req.user.name,
            avatar: req.user.avatar,
          },
        })

        result = {
          type: 'chatroom',
          chatroom,
          redirectTo: `/chatroom/${chatroom._id}`,
          message: 'Successfully joined chatroom!',
        }
      } else {
        result = {
          type: 'chatroom',
          chatroom,
          redirectTo: `/chatroom/${chatroom._id}`,
          message: 'You are already a member of this chatroom',
        }
      }
    } else if (inviteLink.type === 'movie') {
      const movie = await Movie.findById(inviteLink.targetId)
      
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' })
      }

      // Increment link usage
      if (!alreadyUsed) {
        await inviteLink.use(req.user._id, ipAddress)
      }

      result = {
        type: 'movie',
        movie,
        redirectTo: `/movie/${movie._id}`,
        message: 'Enjoy the movie!',
      }
    }

    res.json(result)
  } catch (error) {
    console.error('Use invite link error:', error)
    res.status(500).json({ message: 'Failed to use invite link', error: error.message })
  }
}

// Get user's created invite links
export const getUserInviteLinks = async (req, res) => {
  try {
    const { type, isActive } = req.query

    const query = { createdBy: req.user._id }
    if (type) query.type = type
    if (isActive !== undefined) query.isActive = isActive === 'true'

    const inviteLinks = await InviteLink.find(query)
      .populate('targetId')
      .sort({ createdAt: -1 })

    const linksWithUrls = inviteLinks.map(link => ({
      ...link.toObject(),
      inviteUrl: link.getInviteUrl(process.env.CLIENT_URL),
      isValid: link.isValid(),
    }))

    res.json({ inviteLinks: linksWithUrls })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invite links', error: error.message })
  }
}

// Deactivate invite link
export const deactivateInviteLink = async (req, res) => {
  try {
    const { linkId } = req.params

    const inviteLink = await InviteLink.findById(linkId)

    if (!inviteLink) {
      return res.status(404).json({ message: 'Invite link not found' })
    }

    // Check if user created this link
    if (inviteLink.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    inviteLink.isActive = false
    await inviteLink.save()

    res.json({ message: 'Invite link deactivated', inviteLink })
  } catch (error) {
    res.status(500).json({ message: 'Failed to deactivate invite link', error: error.message })
  }
}

// Get invite link statistics
export const getInviteLinkStats = async (req, res) => {
  try {
    const { linkId } = req.params

    const inviteLink = await InviteLink.findById(linkId)
      .populate('usedBy.user', 'name avatar email')

    if (!inviteLink) {
      return res.status(404).json({ message: 'Invite link not found' })
    }

    // Check if user created this link or is admin
    if (inviteLink.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const stats = {
      totalUses: inviteLink.usedCount,
      maxUses: inviteLink.maxUses,
      remainingUses: inviteLink.maxUses ? inviteLink.maxUses - inviteLink.usedCount : null,
      isActive: inviteLink.isActive,
      isValid: inviteLink.isValid(),
      createdAt: inviteLink.createdAt,
      expiresAt: inviteLink.expiresAt,
      usedBy: inviteLink.usedBy,
    }

    res.json({ stats })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message })
  }
}

// Create public share link (anyone can view, no login required)
export const createPublicShareLink = async (req, res) => {
  try {
    const { type, targetId, metadata } = req.body

    let target
    if (type === 'movie') {
      target = await Movie.findById(targetId)
      if (!target) {
        return res.status(404).json({ message: 'Movie not found' })
      }
    }

    const shareUrl = `${process.env.CLIENT_URL}/share/${type}/${targetId}`

    res.json({
      shareUrl,
      embedCode: `<iframe src="${shareUrl}" width="600" height="400"></iframe>`,
      socialLinks: {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(metadata?.title || 'Check this out!')}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(metadata?.title || '')}`,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create share link', error: error.message })
  }
}

export default {
  createInviteLink,
  getInviteLinkDetails,
  useInviteLink,
  getUserInviteLinks,
  deactivateInviteLink,
  getInviteLinkStats,
  createPublicShareLink,
}
