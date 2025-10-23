import { useState, useEffect } from 'react'
import { Plus, X, Heart, Eye } from 'lucide-react'
import Layout from '../components/Layout'
import CreateStoryModal from '../components/CreateStoryModal'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import { getInitials } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const StoriesPage = () => {
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await axios.get('/social/stories')
      setStories(response.data.stories || [])
    } catch (error) {
      setStories(generateDemoStories())
    }
  }

  const generateDemoStories = () => {
    return Array.from({ length: 8 }, (_, i) => ({
      user: { name: `User ${i}`, avatar: '' },
      stories: [{ _id: i, mediaUrl: `https://picsum.photos/seed/story${i}/400/700`, likes: [], views: [] }],
    }))
  }

  const viewStory = async (storyGroup, index) => {
    setSelectedStory(storyGroup)
    setCurrentIndex(index)
    if (storyGroup.stories[index]?._id) {
      await axios.post(`/social/stories/${storyGroup.stories[index]._id}/view`)
    }
  }

  const handleStoryCreated = (newStory) => {
    fetchStories() // Refresh stories
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Stories</h1>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Story
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {stories.map((storyGroup, idx) => (
            <button key={idx} onClick={() => viewStory(storyGroup, 0)} className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-1">
                  <Avatar className="w-full h-full border-4 border-background">
                    <AvatarImage src={storyGroup.user?.avatar} />
                    <AvatarFallback>{getInitials(storyGroup.user?.name)}</AvatarFallback>
                  </Avatar>
                </div>
                <p className="text-sm text-center mt-2 truncate w-20">{storyGroup.user?.name}</p>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {selectedStory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-50 flex items-center justify-center">
              <button onClick={() => setSelectedStory(null)} className="absolute top-4 right-4 text-white"><X className="w-8 h-8" /></button>
              <div className="relative max-w-md w-full h-full flex items-center">
                <img src={selectedStory.stories[currentIndex]?.mediaUrl} alt="Story" className="w-full rounded-lg" />
                <div className="absolute top-4 left-4 flex items-center gap-3 text-white">
                  <Avatar><AvatarImage src={selectedStory.user?.avatar} /><AvatarFallback>{getInitials(selectedStory.user?.name)}</AvatarFallback></Avatar>
                  <span className="font-semibold">{selectedStory.user?.name}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><Heart className="w-5 h-5" /><span>{selectedStory.stories[currentIndex]?.likes?.length || 0}</span></div>
                    <div className="flex items-center gap-2"><Eye className="w-5 h-5" /><span>{selectedStory.stories[currentIndex]?.views?.length || 0}</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CreateStoryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onStoryCreated={handleStoryCreated}
        />
      </div>
    </Layout>
  )
}

export default StoriesPage
