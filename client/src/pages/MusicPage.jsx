import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipForward, SkipBack, Volume2, Heart, Music as MusicIcon, Search } from 'lucide-react'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

export default function MusicPage() {
  const [music, setMusic] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const audioRef = useRef(null)

  const genres = ['pop', 'rock', 'jazz', 'classical', 'hip-hop', 'electronic', 'country', 'r&b', 'indie']

  useEffect(() => {
    fetchMusic()
  }, [selectedGenre, searchQuery])

  const fetchMusic = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedGenre) params.append('genre', selectedGenre)
      if (searchQuery) params.append('artist', searchQuery)
      
      const res = await axios.get(`/api/library/music?${params.toString()}`)
      setMusic(res.data.music)
    } catch (error) {
      console.error('Failed to fetch music:', error)
      toast.error('Failed to load music')
    }
  }

  const playSong = async (song) => {
    if (currentSong?._id === song._id) {
      togglePlay()
      return
    }

    setCurrentSong(song)
    setIsPlaying(true)
    
    // Track play
    try {
      await axios.post(`/api/library/music/${song._id}/play`)
    } catch (error) {
      console.error('Failed to track play:', error)
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const nextSong = () => {
    const currentIndex = music.findIndex(s => s._id === currentSong?._id)
    if (currentIndex < music.length - 1) {
      playSong(music[currentIndex + 1])
    }
  }

  const prevSong = () => {
    const currentIndex = music.findIndex(s => s._id === currentSong?._id)
    if (currentIndex > 0) {
      playSong(music[currentIndex - 1])
    }
  }

  const handleTimeUpdate = (e) => {
    const percent = (e.target.currentTime / e.target.duration) * 100
    setProgress(percent || 0)
  }

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    if (audioRef.current) {
      audioRef.current.currentTime = audioRef.current.duration * percent
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white pb-32">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-6">Music Library</h1>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              !selectedGenre ? 'bg-purple-600' : 'bg-white/10'
            }`}
          >
            All
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full whitespace-nowrap capitalize ${
                selectedGenre === genre ? 'bg-purple-600' : 'bg-white/10'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Music List */}
      <div className="px-6 space-y-2">
        {music.map((song, index) => (
          <div
            key={song._id}
            onClick={() => playSong(song)}
            className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition ${
              currentSong?._id === song._id
                ? 'bg-purple-600/30'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="relative">
              <img
                src={song.coverImage}
                alt={song.title}
                className="w-16 h-16 rounded"
              />
              {currentSong?._id === song._id && isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold">{song.title}</h3>
              <p className="text-sm text-gray-400">{song.artist}</p>
              <div className="flex items-center gap-2 mt-1">
                {song.genre?.map((g, idx) => (
                  <span key={idx} className="text-xs bg-white/10 px-2 py-1 rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">{formatTime(song.duration)}</p>
              <p className="text-xs text-gray-500">{song.plays || 0} plays</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                // Like song
              }}
              className="p-2 hover:bg-white/10 rounded-full"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Music Player */}
      {currentSong && (
        <>
          <audio
            ref={audioRef}
            src={currentSong.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={nextSong}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black to-gray-900 border-t border-white/10 p-4">
            <div className="max-w-7xl mx-auto">
              {/* Progress Bar */}
              <div
                onClick={handleProgressClick}
                className="w-full bg-white/20 h-1 rounded-full mb-4 cursor-pointer"
              >
                <div
                  className="bg-purple-500 h-1 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Song Info */}
                <img
                  src={currentSong.coverImage}
                  alt={currentSong.title}
                  className="w-16 h-16 rounded"
                />
                <div className="flex-1">
                  <h4 className="font-bold">{currentSong.title}</h4>
                  <p className="text-sm text-gray-400">{currentSong.artist}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button onClick={prevSong} className="hover:text-purple-400">
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>

                  <button onClick={nextSong} className="hover:text-purple-400">
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                {/* Volume & Like */}
                <div className="flex items-center gap-4">
                  <button className="hover:text-red-400">
                    <Heart className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => {
                        setVolume(e.target.value)
                        if (audioRef.current) {
                          audioRef.current.volume = e.target.value
                        }
                      }}
                      className="w-24"
                    />
                  </div>
                </div>

                {/* Time */}
                <div className="text-sm text-gray-400">
                  {formatTime(audioRef.current?.currentTime)} / {formatTime(currentSong.duration)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
