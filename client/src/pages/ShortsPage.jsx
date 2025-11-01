import { useState, useEffect, useRef } from 'react'
import { Heart, MessageCircle, Share2, Music, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

export default function ShortsPage() {
  const [shorts, setShorts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    fetchShorts()
  }, [])

  useEffect(() => {
    // Play current video
    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [currentIndex])

  const fetchShorts = async () => {
    try {
      const res = await axios.get('/api/library/shorts?limit=20')
      setShorts(res.data.shorts)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch shorts:', error)
      toast.error('Failed to load shorts')
      setLoading(false)
    }
  }

  const currentShort = shorts[currentIndex]

  const nextShort = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Load more shorts
      fetchShorts()
    }
  }

  const prevShort = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const likeShort = async () => {
    try {
      const res = await axios.post(`/api/library/shorts/${currentShort._id}/like`)
      
      // Update local state
      setShorts(prev => prev.map((short, idx) => 
        idx === currentIndex
          ? {
              ...short,
              likes: res.data.liked 
                ? [...short.likes, 'current-user']
                : short.likes.filter(id => id !== 'current-user')
            }
          : short
      ))
    } catch (error) {
      console.error('Failed to like short:', error)
      toast.error('Failed to like')
    }
  }

  const shareShort = () => {
    if (navigator.share) {
      navigator.share({
        title: currentShort.title,
        text: currentShort.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading shorts...</div>
      </div>
    )
  }

  if (!currentShort) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white">No shorts available</div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={currentShort.videoUrl}
        className="h-full w-full object-cover"
        autoPlay
        loop
        playsInline
        onClick={() => videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()}
      />

      {/* Overlay Info */}
      <div className="absolute bottom-20 left-4 right-20 text-white z-10">
        <div className="flex items-center gap-3 mb-3">
          <img 
            src={currentShort.uploader?.avatar || '/default-avatar.png'} 
            className="w-12 h-12 rounded-full border-2 border-white"
            alt={currentShort.uploader?.name}
          />
          <div>
            <p className="font-bold">{currentShort.uploader?.name}</p>
            <button className="text-sm bg-white text-black px-4 py-1 rounded-full font-semibold mt-1">
              Follow
            </button>
          </div>
        </div>

        <h3 className="font-bold text-lg mb-1">{currentShort.title}</h3>
        <p className="text-sm opacity-90 mb-2">{currentShort.description}</p>

        {currentShort.tags && currentShort.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {currentShort.tags.map((tag, idx) => (
              <span key={idx} className="text-sm opacity-80">#{tag}</span>
            ))}
          </div>
        )}

        {/* Music info */}
        <div className="flex items-center gap-2 mt-3 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2 w-fit">
          <Music className="w-4 h-4" />
          <span className="text-sm">Original Audio</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
        <button 
          onClick={likeShort}
          className="flex flex-col items-center"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            currentShort.likes?.includes('current-user') 
              ? 'bg-red-500' 
              : 'bg-gray-800/50 backdrop-blur-sm'
          }`}>
            <Heart 
              className={`w-7 h-7 ${
                currentShort.likes?.includes('current-user') 
                  ? 'text-white fill-white' 
                  : 'text-white'
              }`} 
            />
          </div>
          <span className="text-white text-xs mt-1 font-semibold">
            {currentShort.likes?.length || 0}
          </span>
        </button>

        <button className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-semibold">
            {currentShort.comments?.length || 0}
          </span>
        </button>

        <button 
          onClick={shareShort}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-semibold">Share</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
            <MoreVertical className="w-7 h-7 text-white" />
          </div>
        </button>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
        <button
          onClick={prevShort}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={nextShort}
          className="w-10 h-10 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
        {shorts.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full ${
              idx === Math.min(2, currentIndex) ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Swipe areas for mobile */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1" onClick={prevShort} />
        <div className="flex-1" onClick={nextShort} />
      </div>
    </div>
  )
}
