import Movie from '../models/Movie.js'
import User from '../models/User.js'
import { emitSocketEvent } from '../utils/socket.js'

// @desc    Get download links for a movie
// @route   GET /api/movies/:movieId/download
// @access  Private
export const getDownloadLinks = async (req, res) => {
  try {
    const { movieId } = req.params
    const movie = await Movie.findById(movieId)

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    // Check if user has permission to download
    // Ensure subscription is populated so we can inspect its status
    const user = await User.findById(req.user._id).populate('subscription')
    
    // Check subscription status
    if (!user.subscription || (user.subscription.status && user.subscription.status !== 'active')) {
      return res.status(403).json({ 
        message: 'Active subscription required to download movies',
        code: 'SUBSCRIPTION_REQUIRED'
      })
    }

    // Generate download links with different qualities
    const downloadLinks = {
      movieId: movie._id,
      title: movie.title,
      qualities: [
        {
          quality: '4K',
          resolution: '3840x2160',
          size: '8.5 GB',
          url: movie.videoUrl || `https://example.com/movies/${movie._id}/4k.mp4`,
          format: 'mp4',
          bitrate: '25 Mbps',
        },
        {
          quality: '1080p',
          resolution: '1920x1080',
          size: '2.5 GB',
          url: movie.videoUrl || `https://example.com/movies/${movie._id}/1080p.mp4`,
          format: 'mp4',
          bitrate: '8 Mbps',
        },
        {
          quality: '720p',
          resolution: '1280x720',
          size: '1.2 GB',
          url: movie.videoUrl || `https://example.com/movies/${movie._id}/720p.mp4`,
          format: 'mp4',
          bitrate: '5 Mbps',
        },
        {
          quality: '480p',
          resolution: '854x480',
          size: '600 MB',
          url: movie.videoUrl || `https://example.com/movies/${movie._id}/480p.mp4`,
          format: 'mp4',
          bitrate: '2.5 Mbps',
        },
      ],
      subtitles: [
        {
          language: 'English',
          url: `https://example.com/subtitles/${movie._id}/en.srt`,
        },
        {
          language: 'Spanish',
          url: `https://example.com/subtitles/${movie._id}/es.srt`,
        },
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }

    // Log download request
    emitSocketEvent(req, 'download_requested', {
      userId: req.user._id,
      movieId: movie._id,
      movieTitle: movie.title,
      timestamp: new Date(),
    })

    res.json({ downloadLinks })
  } catch (error) {
    console.error('Get download links error:', error)
    res.status(500).json({ message: 'Failed to get download links', error: error.message })
  }
}

// @desc    Track download
// @route   POST /api/movies/:movieId/download/track
// @access  Private
export const trackDownload = async (req, res) => {
  try {
    const { movieId } = req.params
    const { quality } = req.body

    const movie = await Movie.findById(movieId)
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    // Increment download count
    movie.downloads = (movie.downloads || 0) + 1
    await movie.save()

    // Emit Socket.IO event
    emitSocketEvent(req, 'movie_downloaded', {
      userId: req.user._id,
      movieId: movie._id,
      movieTitle: movie.title,
      quality,
      timestamp: new Date(),
    })

    res.json({ 
      message: 'Download tracked successfully',
      downloads: movie.downloads 
    })
  } catch (error) {
    console.error('Track download error:', error)
    res.status(500).json({ message: 'Failed to track download', error: error.message })
  }
}

// @desc    Get user's download history
// @route   GET /api/downloads/history
// @access  Private
export const getDownloadHistory = async (req, res) => {
  try {
    // This would require a Download model to track history
    // For now, return placeholder
    res.json({ 
      downloads: [],
      message: 'Download history feature coming soon' 
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export default {
  getDownloadLinks,
  trackDownload,
  getDownloadHistory,
}
