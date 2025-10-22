import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Film, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import axios from '../lib/axios'

const HomePage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories] = useState(['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Horror'])
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    fetchMovies()
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[500px] rounded-2xl overflow-hidden mb-12"
        >
          <img
            src="https://picsum.photos/seed/hero/1920/500"
            alt="Featured"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 p-12">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">Trending Now</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Featured Movie Title
              </h1>
              <div className="flex items-center gap-4 mb-6 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span>8.5</span>
                </div>
                <span>•</span>
                <span>2024</span>
                <span>•</span>
                <span>Action, Thriller</span>
                <span>•</span>
                <span>2h 15m</span>
              </div>
              <p className="text-white/90 text-lg max-w-2xl mb-8">
                An epic journey through time and space that will keep you on the edge of your seat.
                Experience the thrill like never before.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Watch Now
                </button>
                <button className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition-colors">
                  More Info
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

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

        {/* More Sections */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {generateDemoMovies().slice(0, 5).map((movie) => (
              <MovieCard key={`continue-${movie._id}`} movie={movie} />
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Top Rated</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {generateDemoMovies().slice(0, 5).map((movie) => (
              <MovieCard key={`top-${movie._id}`} movie={movie} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
