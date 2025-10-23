import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Heart, Share2, Star, Clock, Calendar, ThumbsUp, MessageCircle, Bookmark } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import axios from '../lib/axios'
import { formatDuration, formatNumber, getInitials } from '../lib/utils'

const MovieDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovieDetails()
    fetchComments()
  }, [id])

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`/movies/${id}`)
      setMovie(response.data.movie)
    } catch (error) {
      console.error('Error fetching movie:', error)

      // Provide fallback movie data for development
      const fallbackMovie = {
        _id: id,
        title: 'Sample Movie',
        description: 'This is a sample movie for development purposes. The movie you\'re looking for doesn\'t exist in the database yet.',
        poster: '/placeholder-movie.jpg',
        backdrop: '/placeholder-backdrop.jpg',
        year: new Date().getFullYear(),
        duration: 120,
        genre: ['Action', 'Adventure'],
        director: 'Sample Director',
        cast: ['Actor 1', 'Actor 2', 'Actor 3'],
        rating: 8.5,
        ratingCount: 1250,
        likes: 450,
        views: 12500,
        status: 'active',
        featured: false,
        addedBy: {
          _id: '1',
          name: 'Admin User',
          avatar: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setMovie(fallbackMovie)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = () => {
    // Demo comments
    setComments([
      {
        _id: 1,
        user: { name: 'John Doe', avatar: '' },
        text: 'Amazing movie! Highly recommended!',
        likes: 45,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 2,
        user: { name: 'Jane Smith', avatar: '' },
        text: 'Best movie I\'ve seen this year. The cinematography is absolutely stunning!',
        likes: 32,
        createdAt: new Date().toISOString(),
      },
    ])
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment = {
      _id: Date.now(),
      user: { name: 'Current User', avatar: '' },
      text: newComment,
      likes: 0,
      createdAt: new Date().toISOString(),
    }

    setComments([comment, ...comments])
    setNewComment('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-secondary rounded-2xl"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-10 bg-secondary rounded"></div>
              <div className="h-10 bg-secondary rounded"></div>
              <div className="h-10 bg-secondary rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <div className="relative h-[600px] -mt-16">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-96 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full rounded-2xl shadow-2xl"
            />
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 text-white"
          >
            <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{movie.rating}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                <span>{movie.year}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
              <span>•</span>
              <div className="flex gap-2">
                {movie.genre?.map((g) => (
                  <span key={g} className="px-3 py-1 bg-primary/20 rounded-full text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg text-white/90 mb-8 leading-relaxed">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                size="lg"
                onClick={() => navigate(`/watch/${movie._id}`)}
                className="flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsLiked(!isLiked)}
                className={isLiked ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsInWishlist(!isInWishlist)}
              >
                <Bookmark className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Likes</span>
                </div>
                <p className="text-2xl font-semibold">{formatNumber(movie.likes)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Play className="w-4 h-4" />
                  <span>Views</span>
                </div>
                <p className="text-2xl font-semibold">{formatNumber(movie.views)}</p>
              </div>
            </div>

            {/* Cast & Crew */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Director</h3>
                <p className="text-lg">{movie.director}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Cast</h3>
                <p className="text-lg">{movie.cast?.join(', ')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Comments Section */}
        <Card className="mt-12 mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />
              Comments ({comments.length})
            </h2>

            {/* Add Comment */}
            <div className="flex gap-4 mb-8">
              <Avatar>
                <AvatarFallback>CU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <div className="flex justify-end mt-2">
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{getInitials(comment.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{comment.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-foreground/90 mb-2">{comment.text}</p>
                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MovieDetails
