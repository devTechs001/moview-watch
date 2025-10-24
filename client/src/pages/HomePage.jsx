import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, Film, Star, Play, Info, Clock } from 'lucide-react'
import Layout from '../components/Layout'
import MovieCard from '../components/MovieCard'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { formatNumber } from '../lib/utils'

const HomePage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories] = useState(['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Horror'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchMovies()
    fetchFeaturedMovie()
  }, [selectedCategory])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const params = selectedCategory !== 'All' ? { genre: selectedCategory } : {}
      const response = await axios.get('/movies', { params })
      setMovies(response.data.movies || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
      // Demo data for development
      setMovies(generateDemoMovies())
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedMovie = async () => {
    try {
      const response = await axios.get('/movies/featured')
      setFeaturedMovie(response.data.movie)
    } catch (error) {
      // Use demo featured movie
      setFeaturedMovie({
        _id: 'featured',
        title: 'The Last Guardian',
        poster: 'https://picsum.photos/seed/featured/1920/500',
        year: 2024,
        genre: ['Action', 'Thriller'],
        rating: 8.5,
        duration: '2h 15m',
        description: 'An epic journey through time and space that will keep you on the edge of your seat. Experience the thrill like never before.',
      })
    }
  }

  const handleWatchNow = (movieId) => {
    if (movieId) {
      navigate(`/watch/${movieId}`)
    } else {
      toast('Select a movie to watch', { icon: 'ℹ️' })
    }
  }

  const handleMoreInfo = (movieId) => {
    if (movieId) {
      navigate(`/movie/${movieId}`)
    } else {
      toast('Select a movie for more information', { icon: 'ℹ️' })
    }
  }

  const generateDemoMovies = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      _id: i + 1,
      title: `Movie ${i + 1}`,
      poster: `https://picsum.photos/seed/${i}/300/450`,
      year: 2020 + (i % 4),
      genre: [categories[1 + (i % 6)]],
      rating: 7 + Math.random() * 2,
      likes: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
    }))
  }

  return (
    <Layout>
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[600px] md:h-[700px] rounded-2xl overflow-hidden mb-12 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 z-10" />
          <img
            src={featuredMovie?.backdrop || "https://picsum.photos/seed/hero/1920/800"}
            alt="Featured"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
            <div className="absolute bottom-0 left-0 p-6 md:p-12 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-4"
              >
                <TrendingUp className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm md:text-base">Trending Now</span>
                <div className="flex items-center gap-1 ml-4">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 font-semibold">{featuredMovie?.rating || '8.5'}</span>
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
              >
                {featuredMovie?.title || 'Featured Movie Title'}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-2 md:gap-4 mb-6 text-white/90 text-sm md:text-base"
              >
                <span>{featuredMovie?.year || '2024'}</span>
                <span className="hidden md:inline">•</span>
                <span>{featuredMovie?.genre?.join(', ') || 'Action, Thriller'}</span>
                <span className="hidden md:inline">•</span>
                <span>{featuredMovie?.duration || '2h 15m'}</span>
                <span className="hidden md:inline">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredMovie?.views ? formatNumber(featuredMovie.views) + ' views' : '1.2M views'}
                </span>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/90 text-base md:text-lg max-w-2xl mb-8 leading-relaxed"
              >
                {featuredMovie?.description || 'An epic journey through time and space that will keep you on the edge of your seat. Experience the thrill like never before.'}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button 
                  size="lg"
                  onClick={() => handleWatchNow(featuredMovie?._id)}
                  className="px-8 py-3 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 text-white font-semibold"
                >
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Watch Now
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => handleMoreInfo(featuredMovie?._id)}
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 hover:text-white font-semibold"
                >
                  <Info className="w-5 h-5 mr-2" />
                  More Info
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Button
                  onClick={() => {
                    setSelectedCategory(category)
                    toast.success(`Showing ${category === 'All' ? 'all' : category} movies`)
                  }}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className={`whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category
                      ? 'shadow-lg scale-105'
                      : 'hover:scale-105 hover:shadow-md'
                  }`}
                >
                  {category}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Movies Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory === 'All' ? 'Popular Movies' : `${selectedCategory} Movies`}
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-secondary rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}

          {!loading && movies.length === 0 && (
            <div className="text-center py-12">
              <Film className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No movies found</p>
            </div>
          )}
        </div>

        {/* Continue Watching Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Continue Watching</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/history')}
              className="hover:text-primary"
            >
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {generateDemoMovies().slice(0, 5).map((movie) => (
              <MovieCard key={`continue-${movie._id}`} movie={movie} />
            ))}
          </div>
        </div>

        {/* Top Rated Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Rated</h2>
            <Button 
              variant="ghost" 
              onClick={() => {
                navigate('/movies')
                toast.success('Showing top rated movies')
              }}
              className="hover:text-primary"
            >
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {generateDemoMovies().slice(0, 5).map((movie) => (
              <MovieCard key={`top-${movie._id}`} movie={movie} />
            ))}
          </div>
        </div>

        {/* Trending Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Trending This Week
            </h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/trending')}
              className="hover:text-primary"
            >
              View All →
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {generateDemoMovies().slice(0, 5).map((movie) => (
              <MovieCard key={`trending-${movie._id}`} movie={movie} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default HomePage
