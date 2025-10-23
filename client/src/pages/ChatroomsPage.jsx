import { useState, useEffect } from 'react'
import { Users, Plus, Lock, Globe, Video, Search, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { getInitials } from '../lib/utils'

const ChatroomsPage = () => {
  const [publicRooms, setPublicRooms] = useState([])
  const [myRooms, setMyRooms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchChatrooms()
  }, [])

  const fetchChatrooms = async () => {
    try {
      const [publicRes, myRes] = await Promise.all([
        axios.get('/chatrooms/public'),
        axios.get('/chatrooms/my-chatrooms'),
      ])
      setPublicRooms(publicRes.data.chatrooms)
      setMyRooms(myRes.data.chatrooms)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load chatrooms')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (roomId) => {
    try {
      await axios.post(`/chatrooms/${roomId}/join`)
      toast.success('Joined chatroom!')
      fetchChatrooms()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join')
    }
  }

  const filteredPublicRooms = publicRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Chatrooms</h1>
            <p className="text-muted-foreground">Join conversations and connect with others</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Room
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search chatrooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* My Chatrooms */}
        {myRooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">My Chatrooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <ChatroomCard
                  key={room._id}
                  room={room}
                  onJoin={() => navigate(`/chatroom/${room._id}`)}
                  buttonText="Open"
                  buttonVariant="default"
                />
              ))}
            </div>
          </div>
        )}

        {/* Public Chatrooms */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Public Chatrooms</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-32 bg-secondary animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPublicRooms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Chatrooms Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try a different search term' : 'Be the first to create one!'}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>Create Chatroom</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPublicRooms.map((room) => (
                <ChatroomCard
                  key={room._id}
                  room={room}
                  onJoin={() => handleJoinRoom(room._id)}
                  buttonText="Join"
                  buttonVariant="outline"
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateChatroomModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false)
              fetchChatrooms()
            }}
          />
        )}
      </div>
    </Layout>
  )
}

const ChatroomCard = ({ room, onJoin, buttonText, buttonVariant }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={room.avatar} />
            <AvatarFallback>{getInitials(room.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{room.name}</h3>
              {room.type === 'private' ? (
                <Lock className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {room.description || 'No description'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{room.members?.length || 0}</span>
            </div>
            {room.lastMessage && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span className="truncate max-w-[100px]">{room.lastMessage.text}</span>
              </div>
            )}
          </div>
          <Button variant={buttonVariant} size="sm" onClick={onJoin}>
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const CreateChatroomModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/chatrooms', formData)
      toast.success('Chatroom created!')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create chatroom')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Create Chatroom</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Name</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter room name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChatroomsPage
