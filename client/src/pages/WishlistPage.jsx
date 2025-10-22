import { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const response = await axios.get('/user/wishlist')
      setWishlist(response.data.wishlist || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      // Demo data
      setWishlist(generateDemoMovies())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMovies = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      _id: i + 1,
      title: `Wishlist Movie ${i + 1}`,
      poster: `https://picsum.photos/seed/wishlist${i}/300/450`,
      year: 2020 + (i % 5),
      genre: ['Action', 'Thriller'],
      rating: 7 + Math.random() * 2,
      likes: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
    }))
  }

  const clearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      setWishlist([])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-secondary rounded w-1/4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <div>
              <h1 className="text-4xl font-bold">My Wishlist</h1>
              <p className="text-muted-foreground mt-1">
                {wishlist.length} {wishlist.length === 1 ? 'movie' : 'movies'} saved
              </p>
            </div>
          </div>

          {wishlist.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlist.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {wishlist.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding movies you want to watch later
            </p>
            <Button onClick={() => window.location.href = '/home'}>
              Browse Movies
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage
