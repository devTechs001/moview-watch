import { useState, useRef } from 'react'
import { X, Upload, Film, Image as ImageIcon, Camera, Type, Smile, Palette, Sparkles, Music, Video, Mic, Wand2, Sticker, Hash, AtSign } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import MediaUpload from './MediaUpload'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

const EMOJIS = ['😀', '😂', '🥰', '😍', '🤩', '😎', '🔥', '💯', '❤️', '👍', '🎬', '🍿', '⭐', '✨', '🎉', '🎊', '🎵', '🎶', '💬', '👀']

const FILTERS = [
  { name: 'None', value: 'none', style: {} },
  { name: 'Grayscale', value: 'grayscale', style: { filter: 'grayscale(100%)' } },
  { name: 'Sepia', value: 'sepia', style: { filter: 'sepia(100%)' } },
  { name: 'Vintage', value: 'vintage', style: { filter: 'sepia(50%) contrast(120%)' } },
  { name: 'Bright', value: 'bright', style: { filter: 'brightness(120%) contrast(110%)' } },
  { name: 'Dark', value: 'dark', style: { filter: 'brightness(80%) contrast(120%)' } },
  { name: 'Warm', value: 'warm', style: { filter: 'saturate(130%) hue-rotate(-10deg)' } },
  { name: 'Cool', value: 'cool', style: { filter: 'saturate(110%) hue-rotate(10deg)' } },
  { name: 'Blur', value: 'blur', style: { filter: 'blur(2px)' } },
]

const BG_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

const EnhancedCreateStoryModal = ({ isOpen, onClose, onStoryCreated }) => {
  const [storyType, setStoryType] = useState('text')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  
  // Text styling
  const [textColor, setTextColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState(BG_GRADIENTS[0])
  const [fontSize, setFontSize] = useState('medium')
  const [fontWeight, setFontWeight] = useState('normal')
  const [textAlign, setTextAlign] = useState('center')
  
  // Media effects
  const [filter, setFilter] = useState('none')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  
  // Music/Audio
  const [musicFile, setMusicFile] = useState(null)
  const [musicPreview, setMusicPreview] = useState(null)
  
  // Stickers/Emojis
  const [stickers, setStickers] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  // Auto features
  const [autoCaption, setAutoCaption] = useState('')
  const [hashtags, setHashtags] = useState([])
  const [mentions, setMentions] = useState([])
  
  const fileInputRef = useRef(null)
  const musicInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content && !selectedMedia) {
      toast.error('Please add content or media')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      formData.append('type', storyType)
      formData.append('content', content)
      formData.append('textColor', textColor)
      formData.append('backgroundColor', backgroundColor)
      formData.append('fontSize', fontSize)
      formData.append('filter', filter)
      
      if (selectedMedia) {
        formData.append('media', selectedMedia)
      }
      
      if (musicFile) {
        formData.append('music', musicFile)
      }
      
      if (stickers.length > 0) {
        formData.append('stickers', JSON.stringify(stickers))
      }
      
      if (hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(hashtags))
      }

      const response = await axios.post('/social/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Story posted!')
      onStoryCreated?.(response.data.story)
      handleClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post story')
    } finally {
      setLoading(false)
    }
  }

  const handleMediaSelect = (file, type) => {
    setSelectedMedia(file)
    setMediaPreview(URL.createObjectURL(file))
    setStoryType(type)
    setShowMediaUpload(false)
    toast.success(`${type === 'image' ? 'Photo' : 'Video'} added!`)
  }

  const handleMusicSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMusicFile(file)
      setMusicPreview(URL.createObjectURL(file))
      toast.success('Music added!')
    }
  }

  const addEmoji = (emoji) => {
    setContent(content + emoji)
    setShowEmojiPicker(false)
  }

  const addSticker = (emoji) => {
    setStickers([...stickers, {
      emoji,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: 40,
      rotation: Math.random() * 30 - 15
    }])
  }

  const generateAutoCaption = () => {
    const captions = [
      "Just watched an amazing movie! 🎬",
      "Movie night vibes 🍿",
      "This is cinema! 🎥",
      "Highly recommend! ⭐",
      "What a masterpiece! 🎭",
      "Can't stop thinking about this! 💭",
      "Movie magic ✨",
      "Absolutely loved it! ❤️"
    ]
    const randomCaption = captions[Math.floor(Math.random() * captions.length)]
    setContent(randomCaption)
    toast.success('Caption generated!')
  }

  const addHashtag = (tag) => {
    if (!hashtags.includes(tag)) {
      setHashtags([...hashtags, tag])
      setContent(content + ` #${tag}`)
    }
  }

  const handleClose = () => {
    setContent('')
    setSelectedMedia(null)
    setMediaPreview(null)
    setMusicFile(null)
    setMusicPreview(null)
    setStickers([])
    setHashtags([])
    setStoryType('text')
    setFilter('none')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-primary/20 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/10 to-accent/10">
            <div>
              <h2 className="text-3xl font-bold text-gradient">Create Story</h2>
              <p className="text-sm text-muted-foreground mt-1">Share your movie moments</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(90vh-100px)]">
            {/* Preview Panel */}
            <div className="md:w-1/2 p-6 bg-secondary/30 flex items-center justify-center">
              <div 
                className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: storyType === 'text' ? backgroundColor : '#000',
                  ...FILTERS.find(f => f.value === filter)?.style
                }}
              >
                {/* Media Preview */}
                {mediaPreview && (
                  <>
                    {storyType === 'image' ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        style={{
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                        }}
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        className="w-full h-full object-cover"
                        style={{
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
                        }}
                        controls
                      />
                    )}
                  </>
                )}

                {/* Text Content */}
                {content && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center p-8"
                    style={{ textAlign }}
                  >
                    <p 
                      className="font-bold break-words"
                      style={{
                        color: textColor,
                        fontSize: fontSize === 'small' ? '1.5rem' : fontSize === 'medium' ? '2rem' : '2.5rem',
                        fontWeight: fontWeight,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                      }}
                    >
                      {content}
                    </p>
                  </div>
                )}

                {/* Stickers */}
                {stickers.map((sticker, index) => (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      fontSize: `${sticker.size}px`,
                      transform: `rotate(${sticker.rotation}deg)`,
                      cursor: 'move'
                    }}
                  >
                    {sticker.emoji}
                  </div>
                ))}

                {/* Music Indicator */}
                {musicFile && (
                  <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
                    <Music className="w-4 h-4 text-white animate-pulse" />
                    <span className="text-white text-sm">Music added</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Panel */}
            <div className="md:w-1/2 p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Story Type */}
                <div>
                  <label className="block text-sm font-bold mb-3">Story Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { type: 'text', icon: Type, label: 'Text', emoji: '📝' },
                      { type: 'image', icon: ImageIcon, label: 'Photo', emoji: '📷' },
                      { type: 'video', icon: Video, label: 'Video', emoji: '🎥' },
                      { type: 'music', icon: Music, label: 'Music', emoji: '🎵' },
                    ].map(({ type, icon: Icon, label, emoji }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setStoryType(type)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          storyType === type
                            ? 'border-primary bg-primary/20 scale-105 shadow-lg'
                            : 'border-border hover:border-primary/50 hover:scale-105'
                        }`}
                      >
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-xs font-medium">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold">Content</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={generateAutoCaption}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Auto Caption
                    </Button>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's your story?"
                    className="w-full p-4 rounded-xl border-2 border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    rows="3"
                    maxLength="200"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{content.length}/200</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="w-4 h-4 mr-2" />
                      Emoji
                    </Button>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="mt-2 p-3 bg-secondary rounded-xl border grid grid-cols-10 gap-2">
                      {EMOJIS.map((emoji, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addEmoji(emoji)}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-bold mb-3">Media</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowMediaUpload(true)}
                      className="h-20"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => musicInputRef.current?.click()}
                      className="h-20"
                    >
                      <Music className="w-5 h-5 mr-2" />
                      Add Music
                    </Button>
                  </div>
                  <input
                    ref={musicInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleMusicSelect}
                    className="hidden"
                  />
                </div>

                {/* Text Styling (for text stories) */}
                {storyType === 'text' && (
                  <div className="space-y-4">
                    <label className="block text-sm font-bold">Text Style</label>
                    
                    {/* Font Size */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Size</label>
                      <div className="flex gap-2">
                        {['small', 'medium', 'large'].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFontSize(size)}
                            className={`flex-1 py-2 rounded-lg border-2 capitalize ${
                              fontSize === size ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Background Gradients */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Background</label>
                      <div className="grid grid-cols-4 gap-2">
                        {BG_GRADIENTS.map((gradient, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setBackgroundColor(gradient)}
                            className={`h-12 rounded-lg border-2 ${
                              backgroundColor === gradient ? 'border-primary scale-110' : 'border-border'
                            }`}
                            style={{ background: gradient }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters (for image/video) */}
                {(storyType === 'image' || storyType === 'video') && mediaPreview && (
                  <div>
                    <label className="block text-sm font-bold mb-3">Filters & Effects</label>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {FILTERS.slice(0, 6).map((f) => (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFilter(f.value)}
                          className={`p-2 rounded-lg border-2 text-xs ${
                            filter === f.value ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>

                    {/* Adjustments */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Brightness</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={brightness}
                          onChange={(e) => setBrightness(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Contrast</label>
                        <input
                          type="range"
                          min="50"
                          max="150"
                          value={contrast}
                          onChange={(e) => setContrast(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Stickers */}
                <div>
                  <label className="block text-sm font-bold mb-3">Stickers</label>
                  <div className="grid grid-cols-10 gap-2">
                    {EMOJIS.slice(0, 10).map((emoji, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => addSticker(emoji)}
                        className="text-2xl hover:scale-125 transition-transform p-2 hover:bg-secondary rounded-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Hashtags */}
                <div>
                  <label className="block text-sm font-bold mb-3">Quick Hashtags</label>
                  <div className="flex flex-wrap gap-2">
                    {['Movies', 'Cinema', 'FilmReview', 'MustWatch', 'MovieNight'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addHashtag(tag)}
                        className="px-3 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-sm border border-primary/30"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || (!content && !selectedMedia)}
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Post Story
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Media Upload Modal */}
        {showMediaUpload && (
          <MediaUpload
            onMediaSelect={handleMediaSelect}
            onClose={() => setShowMediaUpload(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default EnhancedCreateStoryModal
