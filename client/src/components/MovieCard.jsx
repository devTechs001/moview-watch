import { Link } from 'react-router-dom'
import { Heart, Star, Play, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { formatNumber } from '../lib/utils'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const MovieCard = ({ movie }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(movie.likes || 0)

  const handleLike = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put(`/movies/${movie._id}/like`)
      setLikes(response.data.likes)
      setIsLiked(!isLiked)
      toast.success(isLiked ? 'Removed from likes' : 'Added to likes!')
    } catch (error) {
      console.error('Error liking movie:', error)
      // Optimistic update for demo
      setIsLiked(!isLiked)
      setLikes(prev => isLiked ? prev - 1 : prev + 1)
    }
  }

  const handleShare = (e) => {
    e.preventDefault()
    const url = `${window.location.origin}/movie/${movie._id}`
    
    if (navigator.share) {
      navigator.share({
        title: movie.title,
        text: `Check out ${movie.title}!`,
        url: url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/movie/${movie._id}`} className="group block">
        <div className="relative overflow-hidden rounded-lg shadow-lg bg-card">
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center"
                >
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </motion.div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleLike}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors"
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
            </div>

            {/* Rating Badge */}
            {movie.rating && (
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm font-semibold">{movie.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.genre?.join(', ')}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{formatNumber(likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>{formatNumber(movie.views || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default MovieCard
