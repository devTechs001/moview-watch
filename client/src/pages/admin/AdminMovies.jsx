import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Star } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

const AdminMovies = () => {
  const [movies, setMovies] = useState([
    { id: 1, title: 'Action Movie', year: 2024, genre: 'Action', rating: 8.5, views: 12453, status: 'active' },
    { id: 2, title: 'Comedy Film', year: 2024, genre: 'Comedy', rating: 7.8, views: 8932, status: 'active' },
    { id: 3, title: 'Drama Series', year: 2023, genre: 'Drama', rating: 9.1, views: 15234, status: 'active' },
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const handleDeleteMovie = (id) => {
    if (confirm('Are you sure?')) {
      setMovies(movies.filter((m) => m.id !== id))
    }
  }

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Manage Movies</h1>
          <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Movie
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold">Movie</th>
                    <th className="text-left p-4 font-semibold">Year</th>
                    <th className="text-left p-4 font-semibold">Genre</th>
                    <th className="text-left p-4 font-semibold">Rating</th>
                    <th className="text-left p-4 font-semibold">Views</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((movie) => (
                    <tr key={movie.id} className="border-b hover:bg-accent">
                      <td className="p-4 font-medium">{movie.title}</td>
                      <td className="p-4">{movie.year}</td>
                      <td className="p-4">{movie.genre}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {movie.rating}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {movie.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">
                          {movie.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMovie(movie.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminMovies
