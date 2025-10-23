import { useState } from 'react'
import { X, Upload, Film, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const CreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const [storyType, setStoryType] = useState('text')
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [movieId, setMovieId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content && !mediaUrl) {
      toast.error('Please add content or media')
      return
    }

    try {
      setLoading(true)
      const storyData = {
        type: storyType,
        content,
        mediaUrl,
      }

      if (movieId) {
        storyData.movie = movieId
      }

      const response = await axios.post('/social/stories', storyData)
      toast.success('Story posted!')
      onStoryCreated?.(response.data.story)
      handleClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post story')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setContent('')
    setMediaUrl('')
    setMovieId('')
    setStoryType('text')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto border shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Create Story</h2>
          <button onClick={handleClose} className="p-2 hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Story Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Story Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStoryType('text')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  storyType === 'text'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-2xl mb-1">📝</div>
                <div className="text-xs font-medium">Text</div>
              </button>
              <button
                type="button"
                onClick={() => setStoryType('image')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  storyType === 'image'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Image</div>
              </button>
              <button
                type="button"
                onClick={() => setStoryType('movie_review')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  storyType === 'movie_review'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Film className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Review</div>
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-3 rounded-lg border border-input bg-background resize-none"
              required
            />
          </div>

          {/* Media URL */}
          {(storyType === 'image' || storyType === 'video') && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {storyType === 'image' ? 'Image URL' : 'Video URL'}
              </label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={`Enter ${storyType} URL`}
              />
              {mediaUrl && storyType === 'image' && (
                <img src={mediaUrl} alt="Preview" className="mt-2 w-full h-48 object-cover rounded" />
              )}
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Posting...' : 'Post Story'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateStoryModal
