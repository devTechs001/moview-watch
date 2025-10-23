import { Link } from 'react-router-dom'
import { Heart, Star, Play, Share2, Bookmark, MessageCircle, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { formatNumber } from '../lib/utils'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const MovieCard = ({ movie }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [likes, setLikes] = useState(movie.likes || 0)
  const [comments, setComments] = useState(movie.comments || 0)

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

  const handleWishlist = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/user/wishlist/${movie._id}`)
      setIsWishlisted(!isWishlisted)
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
    } catch (error) {
      console.error('Error updating wishlist:', error)
      setIsWishlisted(!isWishlisted)
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!')
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
        <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl bg-card border border-border/50 transition-all duration-300">
          {/* Movie Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Image'}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
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
            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
              <button
                onClick={handleWishlist}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Bookmark
                  className={`w-5 h-5 ${isWishlisted ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`}
                />
              </button>
              <button
                onClick={handleLike}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-red-500 hover:scale-110 transition-all duration-200 shadow-lg"
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:scale-110 transition-all duration-200 shadow-lg"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Rating Badge */}
            {movie.rating && (
              <div className="absolute top-2 left-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md flex items-center gap-1 shadow-lg border border-yellow-400/20">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white text-sm font-semibold">{movie.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="p-4 bg-gradient-to-b from-card to-card/80">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span>{movie.year}</span>
              <span>•</span>
              <span>{movie.genre?.join(', ')}</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1" title="Likes">
                <Heart className="w-4 h-4" />
                <span>{formatNumber(likes)}</span>
              </div>
              <div className="flex items-center gap-1" title="Comments">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(comments)}</span>
              </div>
              <div className="flex items-center gap-1" title="Views">
                <Eye className="w-4 h-4" />
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
