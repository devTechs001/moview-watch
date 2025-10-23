import { Clock } from 'lucide-react'
import Layout from '../components/Layout'
import MovieCard from '../components/MovieCard'

const HistoryPage = () => {
  const movies = Array.from({ length: 12 }, (_, i) => ({
    _id: i + 1,
    title: `Recently Watched ${i + 1}`,
    poster: `https://picsum.photos/seed/history${i}/300/450`,
    year: 2024,
    genre: ['Drama'],
    rating: 8.0,
    likes: 1000,
    views: 50000,
  }))

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Clock className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Watch History</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      </div>
    </Layout>
  )
}

export default HistoryPage
