import Short from '../models/Short.js'
import Music from '../models/Music.js'
import Animation from '../models/Animation.js'
import { emitSocketEvent } from '../utils/socket.js'

// ============= SHORTS =============

// @desc    Get all shorts
// @route   GET /api/library/shorts
// @access  Public
export const getShorts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query

    const query = { status: 'approved', isPublic: true }
    if (category) query.category = category

    const shorts = await Short.find(query)
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Short.countDocuments(query)

    res.json({
      shorts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload short
// @route   POST /api/library/shorts
// @access  Private
export const uploadShort = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnail, duration, category, tags } = req.body

    const short = await Short.create({
      title,
      description,
      videoUrl,
      thumbnail,
      duration,
      category,
      tags,
      uploader: req.user._id,
    })

    await short.populate('uploader', 'name avatar')

    emitSocketEvent(req, 'new_short', { short })

    res.status(201).json({ short, message: 'Short uploaded successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like short
// @route   POST /api/library/shorts/:id/like
// @access  Private
export const likeShort = async (req, res) => {
  try {
    const short = await Short.findById(req.params.id)
    if (!short) {
      return res.status(404).json({ message: 'Short not found' })
    }

    const alreadyLiked = short.likes.includes(req.user._id)

    if (alreadyLiked) {
      short.likes = short.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      short.likes.push(req.user._id)
    }

    await short.save()

    emitSocketEvent(req, 'short_liked', {
      shortId: short._id,
      userId: req.user._id,
      liked: !alreadyLiked,
    })

    res.json({ liked: !alreadyLiked, likeCount: short.likes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============= MUSIC =============

// @desc    Get all music
// @route   GET /api/library/music
// @access  Public
export const getMusic = async (req, res) => {
  try {
    const { genre, artist, page = 1, limit = 50 } = req.query

    const query = { status: 'active', isPublic: true }
    if (genre) query.genre = genre
    if (artist) query.artist = new RegExp(artist, 'i')

    const music = await Music.find(query)
      .populate('uploader', 'name avatar')
      .sort({ plays: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Music.countDocuments(query)

    res.json({
      music,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload music
// @route   POST /api/library/music
// @access  Private
export const uploadMusic = async (req, res) => {
  try {
    const { title, artist, album, audioUrl, coverImage, duration, genre, releaseYear, lyrics } = req.body

    const music = await Music.create({
      title,
      artist,
      album,
      audioUrl,
      coverImage,
      duration,
      genre,
      releaseYear,
      lyrics,
      uploader: req.user._id,
    })

    await music.populate('uploader', 'name avatar')

    emitSocketEvent(req, 'new_music', { music })

    res.status(201).json({ music, message: 'Music uploaded successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Play music (track play count)
// @route   POST /api/library/music/:id/play
// @access  Public
export const playMusic = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id)
    if (!music) {
      return res.status(404).json({ message: 'Music not found' })
    }

    music.plays += 1
    await music.save()

    res.json({ plays: music.plays })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============= ANIMATIONS =============

// @desc    Get all animations
// @route   GET /api/library/animations
// @access  Public
export const getAnimations = async (req, res) => {
  try {
    const { type, genre, status, page = 1, limit = 20 } = req.query

    const query = { isPublic: true }
    if (type) query.type = type
    if (genre) query.genre = genre
    if (status) query.status = status

    const animations = await Animation.find(query)
      .sort({ rating: -1, views: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Animation.countDocuments(query)

    res.json({
      animations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single animation
// @route   GET /api/library/animations/:id
// @access  Public
export const getAnimation = async (req, res) => {
  try {
    const animation = await Animation.findById(req.params.id)

    if (!animation) {
      return res.status(404).json({ message: 'Animation not found' })
    }

    // Increment views
    animation.views += 1
    await animation.save()

    res.json({ animation })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Add animation
// @route   POST /api/library/animations
// @access  Private (Admin)
export const addAnimation = async (req, res) => {
  try {
    const animation = await Animation.create(req.body)

    emitSocketEvent(req, 'new_animation', { animation })

    res.status(201).json({ animation, message: 'Animation added successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Like animation
// @route   POST /api/library/animations/:id/like
// @access  Private
export const likeAnimation = async (req, res) => {
  try {
    const animation = await Animation.findById(req.params.id)
    if (!animation) {
      return res.status(404).json({ message: 'Animation not found' })
    }

    const alreadyLiked = animation.likes.includes(req.user._id)

    if (alreadyLiked) {
      animation.likes = animation.likes.filter(id => id.toString() !== req.user._id.toString())
    } else {
      animation.likes.push(req.user._id)
    }

    await animation.save()

    res.json({ liked: !alreadyLiked, likeCount: animation.likes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getShorts,
  uploadShort,
  likeShort,
  getMusic,
  uploadMusic,
  playMusic,
  getAnimations,
  getAnimation,
  addAnimation,
  likeAnimation,
}
