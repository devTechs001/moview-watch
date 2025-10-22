import { useState, useEffect, useRef } from 'react'
import { Send, Phone, Video, MoreVertical, Search, Smile } from 'lucide-react'
import Navbar from '../components/Navbar'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { getInitials } from '../lib/utils'

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  const contacts = [
    { id: 1, name: 'John Doe', avatar: '', status: 'online', lastMessage: 'Hey, have you seen the latest movie?', time: '2m ago' },
    { id: 2, name: 'Jane Smith', avatar: '', status: 'offline', lastMessage: 'The cinematography was amazing!', time: '1h ago' },
    { id: 3, name: 'Mike Johnson', avatar: '', status: 'online', lastMessage: 'Want to watch together?', time: '3h ago' },
    { id: 4, name: 'Sarah Williams', avatar: '', status: 'online', lastMessage: 'I just added it to my wishlist', time: '1d ago' },
  ]

  useEffect(() => {
    if (selectedUser) {
      // Load messages for selected user
      setMessages([
        { id: 1, text: 'Hey! How are you?', sender: 'other', timestamp: new Date() },
        { id: 2, text: 'I\'m doing great! Have you seen the new action movie?', sender: 'me', timestamp: new Date() },
        { id: 3, text: 'Not yet, but it\'s on my wishlist. Is it good?', sender: 'other', timestamp: new Date() },
        { id: 4, text: 'Absolutely! The action sequences are incredible. Highly recommend!', sender: 'me', timestamp: new Date() },
      ])
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'me',
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setMessage('')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 h-[calc(100vh-120px)]">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Contacts Sidebar */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-2xl font-bold mb-4">Messages</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedUser(contact)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors ${
                      selectedUser?.id === contact.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                      </Avatar>
                      {contact.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{contact.name}</h3>
                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
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
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.status === 'online' ? 'Online' : 'Offline'}
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
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender === 'me'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="ghost" size="icon">
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!message.trim()}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Video className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a contact to start chatting</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage
