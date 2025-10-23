import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Smile, Paperclip, Video, Phone, MoreVertical, ArrowLeft, Users, Share2 } from 'lucide-react'
import Layout from '../components/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import ShareModal from '../components/ShareModal'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../lib/utils'
import { getInitials } from '../lib/utils'

const ChatroomView = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [chatroom, setChatroom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showShare, setShowShare] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchChatroom()
    fetchMessages()

    // Setup Socket.io
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // Join chatroom
    newSocket.emit('join-chatroom', roomId)

    // Listen for new messages
    newSocket.on('new_chatroom_message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    // Listen for user joined
    newSocket.on('user_joined_chatroom', (data) => {
      toast.success('A user joined the room')
    })

    // Listen for user left
    newSocket.on('user_left_chatroom', (data) => {
      toast('A user left the room')
    })

    return () => {
      newSocket.emit('leave-chatroom', roomId)
      newSocket.disconnect()
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatroom = async () => {
    try {
      const response = await axios.get(`/chatrooms/${roomId}`)
      setChatroom(response.data.chatroom)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load chatroom')
      navigate('/chatrooms')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/chatrooms/${roomId}/messages`)
      setMessages(response.data.messages)
    } catch (error) {
      console.error(error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await axios.post(`/chatrooms/${roomId}/messages`, {
        content: newMessage,
        type: 'text',
      })

      // Emit socket event
      if (socket) {
        socket.emit('chatroom-message', {
          chatroomId: roomId,
          message: response.data.message,
        })
      }

      setMessages([...messages, response.data.message])
      setNewMessage('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleReact = async (messageId, emoji) => {
    try {
      await axios.post(`/chatrooms/messages/${messageId}/react`, { emoji })
    } catch (error) {
      toast.error('Failed to react')
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await axios.post(`/chatrooms/${roomId}/leave`)
      toast.success('Left chatroom')
      navigate('/chatrooms')
    } catch (error) {
      toast.error('Failed to leave chatroom')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        {/* Header */}
        <Card className="rounded-none border-x-0 border-t-0">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/chatrooms')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarImage src={chatroom?.avatar} />
                <AvatarFallback>{getInitials(chatroom?.name || 'C')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{chatroom?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {chatroom?.members?.length || 0} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowShare(true)}>
                <Share2 className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLeaveRoom}>
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender._id !== user?._id && (
                <Avatar className="w-8 h-8 mr-2">
                  <AvatarImage src={msg.sender.avatar} />
                  <AvatarFallback>{getInitials(msg.sender.name)}</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[70%] ${msg.sender._id === user?._id ? 'items-end' : 'items-start'} flex flex-col`}>
                {msg.sender._id !== user?._id && (
                  <span className="text-xs text-muted-foreground mb-1">{msg.sender.name}</span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.sender._id === user?._id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  <p>{msg.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1">
                        {msg.reactions.map((reaction, idx) => (
                          <span key={idx} className="text-xs">
                            {reaction.emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <Card className="rounded-none border-x-0 border-b-0">
          <form onSubmit={handleSendMessage} className="p-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                autoFocus
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Share Modal */}
      {showShare && (
        <ShareModal
          type="chatroom"
          targetId={roomId}
          title={chatroom?.name}
          onClose={() => setShowShare(false)}
        />
      )}
    </Layout>
  )
}

export default ChatroomView
