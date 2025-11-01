import { useState, useEffect } from 'react'
import { Play, Star, Heart, Info } from 'lucide-react'
import axios from '../lib/axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AnimationsPage() {
  const [animations, setAnimations] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const navigate = useNavigate()

  const types = ['series', 'movie', 'short']
  const genres = ['action', 'comedy', 'adventure', 'fantasy', 'sci-fi', 'slice-of-life', 'romance', 'horror', 'mystery']
  const statuses = ['ongoing', 'completed', 'upcoming']

  useEffect(() => {
    fetchAnimations()
  }, [selectedType, selectedGenre, selectedStatus])

  const fetchAnimations = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedType) params.append('type', selectedType)
      if (selectedGenre) params.append('genre', selectedGenre)
      if (selectedStatus) params.append('status', selectedStatus)

      const res = await axios.get(`/api/library/animations?${params.toString()}`)
      setAnimations(res.data.animations)
    } catch (error) {
      console.error('Failed to fetch animations:', error)
      toast.error('Failed to load animations')
    }
  }

  const likeAnimation = async (animationId, e) => {
    e.stopPropagation()
    try {
      await axios.post(`/api/library/animations/${animationId}/like`)
      toast.success('Added to favorites!')
    } catch (error) {
      console.error('Failed to like animation:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Animations</h1>
        <p className="text-gray-400">Discover amazing anime series and movies</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Type Filter */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Type</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('')}
              className={`px-4 py-2 rounded-full capitalize ${
                !selectedType ? 'bg-purple-600' : 'bg-gray-800'
              }`}
            >
              All
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full capitalize ${
                  selectedType === type ? 'bg-purple-600' : 'bg-gray-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Genre</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedGenre('')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                !selectedGenre ? 'bg-purple-600' : 'bg-gray-800'
              }`}
            >
              All
            </button>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full whitespace-nowrap capitalize ${
                  selectedGenre === genre ? 'bg-purple-600' : 'bg-gray-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Status</p>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-4 py-2 rounded-full capitalize ${
                !selectedStatus ? 'bg-purple-600' : 'bg-gray-800'
              }`}
            >
              All
            </button>
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full capitalize ${
                  selectedStatus === status ? 'bg-purple-600' : 'bg-gray-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {animations.map(animation => (
          <div
            key={animation._id}
            onClick={() => navigate(`/animations/${animation._id}`)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-lg mb-3">
              <img
                src={animation.poster}
                alt={animation.title}
                className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/animations/${animation._id}`)
                    }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition"
                  >
                    <Play className="w-5 h-5 text-black ml-1" />
                  </button>

                  <button
                    onClick={(e) => likeAnimation(animation._id, e)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <Heart className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Show info modal
                    }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition"
                  >
                    <Info className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-gray-300 line-clamp-2">
                  {animation.description}
                </p>
              </div>

              {/* Type Badge */}
              <div className="absolute top-2 left-2 bg-purple-600 px-2 py-1 rounded text-xs font-semibold capitalize">
                {animation.type}
              </div>

              {/* Status Badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold capitalize ${
                animation.status === 'ongoing' ? 'bg-green-600' :
                animation.status === 'completed' ? 'bg-blue-600' :
                'bg-orange-600'
              }`}>
                {animation.status}
              </div>

              {/* Rating */}
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-semibold">{animation.rating}</span>
              </div>
            </div>

            <h3 className="font-semibold mb-1 line-clamp-2">{animation.title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{animation.releaseYear}</span>
              <span>•</span>
              <span>{animation.ageRating}</span>
              {animation.type === 'series' && animation.seasons && (
                <>
                  <span>•</span>
                  <span>{animation.seasons.length} Season{animation.seasons.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>

            {/* Genres */}
            <div className="flex gap-1 mt-2 flex-wrap">
              {animation.genre?.slice(0, 3).map((g, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-800 px-2 py-1 rounded capitalize"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {animations.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No animations found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  )
}
