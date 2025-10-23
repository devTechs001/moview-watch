import { useState, useEffect, useRef } from 'react'
import { Send, Phone, Video, MoreVertical, Search, Smile, Paperclip, Mic, Users } from 'lucide-react'
import Layout from '../components/Layout'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { getInitials } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../lib/utils'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import VideoCall from '../components/VideoCall'

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [socket, setSocket] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [callData, setCallData] = useState(null)
  const messagesEndRef = useRef(null)
  const { user } = useAuthStore()

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL)
    setSocket(newSocket)

    // Join user's chat room
    if (user?._id) {
      newSocket.emit('join-chat', user._id)
    }

    // Listen for incoming messages
    newSocket.on('receive-message', (data) => {
      if (selectedUser && (data.senderId === selectedUser._id || data.sender._id === selectedUser._id)) {
        setMessages((prev) => [...prev, {
          _id: data.messageId || Date.now(),
          content: data.content || data.text,
          sender: data.sender || data.senderId,
          timestamp: new Date(data.timestamp || Date.now()),
          type: data.type || 'text',
        }])
      }
    })

    // Listen for typing indicator
    newSocket.on('user-typing', (data) => {
      if (selectedUser && data.senderId === selectedUser._id) {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 3000)
      }
    })

    // Listen for incoming calls
    newSocket.on('incoming-call', (data) => {
      toast.success(`Incoming ${data.type} call from ${data.callerName}`, {
        duration: 10000,
        action: {
          label: 'Accept',
          onClick: () => acceptCall(data),
        },
      })
    })

    return () => {
      newSocket.disconnect()
    }
  }, [user, selectedUser])

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser._id)
      markMessagesAsRead(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      const response = await axios.get('/chat/conversations')
      setConversations(response.data.conversations)
    } catch (error) {
      console.error('Load conversations error:', error)
      // Fallback to sample data
      setConversations([
        {
          _id: '1',
          user: {
            _id: '1',
            name: 'John Doe',
            avatar: '',
            email: 'john@example.com'
          },
          lastMessage: {
            content: 'Hey, have you seen the latest movie?',
            createdAt: new Date()
          },
          unreadCount: 2
        },
        {
          _id: '2',
          user: {
            _id: '2',
            name: 'Jane Smith',
            avatar: '',
            email: 'jane@example.com'
          },
          lastMessage: {
            content: 'The cinematography was amazing!',
            createdAt: new Date()
          },
          unreadCount: 0
        }
      ])
    }
  }

  const loadMessages = async (userId) => {
    try {
      const response = await axios.get(`/chat/messages/${userId}`)
      setMessages(response.data.messages.map(msg => ({
        _id: msg._id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.createdAt),
        type: msg.type,
        isRead: msg.isRead,
      })))
    } catch (error) {
      console.error('Load messages error:', error)
      // Fallback to sample messages
      setMessages([
        {
          _id: '1',
          content: 'Hey! How are you?',
          sender: selectedUser,
          timestamp: new Date(),
          type: 'text'
        },
        {
          _id: '2',
          content: 'I\'m doing great! Have you seen the new action movie?',
          sender: user,
          timestamp: new Date(),
          type: 'text'
        },
      ])
    }
  }

  const markMessagesAsRead = async (userId) => {
    try {
      await axios.put(`/chat/messages/${userId}/read`)
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !selectedUser) return

    try {
      const response = await axios.post('/chat/messages', {
        recipientId: selectedUser._id,
        content: message.trim(),
        type: 'text'
      })

      const newMessage = {
        _id: response.data.message._id,
        content: response.data.message.content,
        sender: user,
        timestamp: new Date(response.data.message.createdAt),
        type: response.data.message.type,
        isDelivered: true,
      }

      setMessages([...messages, newMessage])

      // Send via Socket.io for real-time
      if (socket) {
        socket.emit('send-message', {
          recipientId: selectedUser._id,
          content: message.trim(),
          senderId: user._id,
          messageId: newMessage._id,
        })
      }

      setMessage('')
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Failed to send message')
    }
  }

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit('typing', {
        recipientId: selectedUser._id,
        senderId: user._id,
      })
    }
  }

  const handleStartVideoCall = async () => {
    if (!selectedUser) return

    try {
      const response = await axios.post('/chat/video-call', {
        recipientId: selectedUser._id
      })

      setCallData({
        callId: response.data.callId,
        caller: user,
        recipient: selectedUser,
        callType: 'video'
      })
      setShowVideoCall(true)

      // Emit Socket.io event
      if (socket) {
        socket.emit('initiate-call', {
          recipientId: selectedUser._id,
          callerId: user._id,
          callerName: user.name,
          callerAvatar: user.avatar,
          type: 'video',
        })
      }
    } catch (error) {
      console.error('Start video call error:', error)
      toast.error('Failed to start video call')
    }
  }

  const handleStartAudioCall = async () => {
    if (!selectedUser) return

    try {
      const response = await axios.post('/chat/audio-call', {
        recipientId: selectedUser._id
      })

      setCallData({
        callId: response.data.callId,
        caller: user,
        recipient: selectedUser,
        callType: 'audio'
      })
      setShowVideoCall(true)

      // Emit Socket.io event
      if (socket) {
        socket.emit('initiate-call', {
          recipientId: selectedUser._id,
          callerId: user._id,
          callerName: user.name,
          callerAvatar: user.avatar,
          type: 'audio',
        })
      }
    } catch (error) {
      console.error('Start audio call error:', error)
      toast.error('Failed to start audio call')
    }
  }

  const acceptCall = (callData) => {
    setCallData(callData)
    setShowVideoCall(true)

    if (socket) {
      socket.emit('accept-call', {
        callerId: callData.callerId,
        callId: callData.callId,
      })
    }
  }

  const rejectCall = (callData) => {
    if (socket) {
      socket.emit('reject-call', {
        callerId: callData.callerId,
        callId: callData.callId,
      })
    }
    toast.error('Call declined')
  }

  const handleSearchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await axios.get(`/chat/search-users?query=${query}`)
      setSearchResults(response.data.users)
    } catch (error) {
      console.error('Search users error:', error)
    }
  }

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setSearchResults([])
    setSearchQuery('')
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Contacts Sidebar */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-2xl font-bold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearchUsers(e.target.value)
                    }}
                  />
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className="w-full p-2 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => handleSelectUser(conversation.user)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors ${
                      selectedUser?._id === conversation.user._id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatar} />
                        <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{conversation.user.name}</h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9">
            {selectedUser ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.avatar} />
                      <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name}</h3>
                      <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleStartAudioCall} title="Audio call">
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleStartVideoCall} title="Video call">
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" title="More options">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender._id === user._id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {msg.sender._id === user._id && (
                            <p className="text-xs opacity-70">
                              {msg.isDelivered ? '✓✓' : '✓'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-2xl px-4 py-2">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">typing...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" title="Attach file">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" title="Emoji">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        handleTyping()
                      }}
                      placeholder="Type a message..."
                      className="flex-1"
                      autoFocus
                    />
                    {message.trim() ? (
                      <Button type="submit" size="icon">
                        <Send className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button type="button" variant="ghost" size="icon" title="Voice message">
                        <Mic className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a contact to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCall && callData && (
        <VideoCall
          callData={callData}
          onClose={() => {
            setShowVideoCall(false)
            setCallData(null)
          }}
        />
      )}
    </Layout>
  )
}

export default ChatPage
