import { useState } from 'react'
import { Download, Search, Film, TrendingUp, Star } from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import axios from '../../lib/axios'
import toast from 'react-hot-toast'

const TMDBImporter = () => {
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [importStats, setImportStats] = useState(null)

  const fetchPopular = async () => {
    try {
      setLoading(true)
      toast.loading('Fetching popular movies...')
      const response = await axios.post('/admin/tmdb/fetch-popular', { save: true })
      setImportStats(response.data)
      toast.dismiss()
      toast.success(response.data.message)
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrending = async () => {
    try {
      setLoading(true)
      toast.loading('Fetching trending movies...')
      const response = await axios.post('/admin/tmdb/fetch-trending', { save: true })
      setImportStats(response.data)
      toast.dismiss()
      toast.success(response.data.message)
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.message || 'Failed to fetch movies')
    } finally {
      setLoading(false)
    }
  }

  const searchMovies = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const response = await axios.get('/admin/tmdb/search', {
        params: { query: searchQuery },
      })
      setSearchResults(response.data.movies)
      toast.success(`Found ${response.data.count} movies`)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const importMovie = async (tmdbId) => {
    try {
      const response = await axios.post(`/admin/tmdb/import/${tmdbId}`)
      toast.success('Movie imported successfully!')
      setSearchResults(searchResults.filter((m) => m.tmdbId !== tmdbId))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to import movie')
    }
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">TMDB Movie Importer</h1>
          <p className="text-muted-foreground">Import movies from The Movie Database</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <Film className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Popular Movies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Import the most popular movies right now
              </p>
              <Button onClick={fetchPopular} disabled={loading} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Import Popular
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <TrendingUp className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Trending Movies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Import trending movies this week
              </p>
              <Button onClick={fetchTrending} disabled={loading} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Import Trending
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Star className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Top Rated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Import the highest rated movies
              </p>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {importStats && (
          <Card className="mb-8 border-green-500">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-2 text-green-500">Import Successful!</h3>
              <p>{importStats.message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                New movies saved: {importStats.savedCount}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Search & Import Movies</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchMovies} className="mb-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for movies on TMDB..."
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  Search
                </Button>
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {searchResults.map((movie) => (
                  <div key={movie.tmdbId} className="border rounded-lg p-3">
                    {movie.poster && (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full aspect-[2/3] object-cover rounded mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                      {movie.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {movie.year} • ⭐ {movie.rating?.toFixed(1)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => importMovie(movie.tmdbId)}
                      className="w-full"
                    >
                      Import
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default TMDBImporter
