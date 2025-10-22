import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import MovieCard from '../components/MovieCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import axios from '../lib/axios'

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Horror', 'Romance', 'Animation']
  const years = ['All', '2024', '2023', '2022', '2021', '2020', '2019']
  const ratings = ['All', '9+', '8+', '7+', '6+', '5+']

  useEffect(() => {
    if (searchQuery || filters.genre || filters.year || filters.rating) {
      searchMovies()
    }
  }, [searchQuery, filters])

  const searchMovies = async () => {
    try {
      setLoading(true)
      const params = {
        search: searchQuery,
        ...filters,
      }
      const response = await axios.get('/movies/search', { params })
      setMovies(response.data.movies || [])
    } catch (error) {
      console.error('Error searching movies:', error)
      // Demo data
      setMovies(generateDemoMovies())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoMovies = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      _id: i + 1,
      title: `Search Result ${i + 1}`,
      poster: `https://picsum.photos/seed/search${i}/300/450`,
      year: 2020 + (i % 5),
      genre: [genres[1 + (i % 8)]],
      rating: 5 + Math.random() * 4,
      likes: Math.floor(Math.random() * 10000),
      views: Math.floor(Math.random() * 100000),
    }))
  }

  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      rating: '',
    })
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">Search Movies</h1>

          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, actors, directors..."
                className="pl-12 h-12 text-lg"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Genre Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => setFilters({ ...filters, genre: genre === 'All' ? '' : genre })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          (genre === 'All' && !filters.genre) || filters.genre === genre
                            ? 'bg-primary text-white'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">Year</label>
                  <div className="flex flex-wrap gap-2">
                    {years.map((year) => (
                      <button
                        key={year}
                        onClick={() => setFilters({ ...filters, year: year === 'All' ? '' : year })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          (year === 'All' && !filters.year) || filters.year === year
                            ? 'bg-primary text-white'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">Rating</label>
                  <div className="flex flex-wrap gap-2">
                    {ratings.map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, rating: rating === 'All' ? '' : rating })}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          (rating === 'All' && !filters.rating) || filters.rating === rating
                            ? 'bg-primary text-white'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : 'Browse all movies'}
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
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No movies found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchPage
