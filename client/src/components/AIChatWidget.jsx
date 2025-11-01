import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react'
import axios from '../lib/axios'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    checkIfEnabled()
    if (isEnabled) {
      loadHistory()
    }
  }, [isEnabled])

  const checkIfEnabled = async () => {
    try {
      const res = await axios.get('/api/ai-assistant/settings')
      setIsEnabled(res.data.settings?.assistant?.enabled || false)
    } catch (error) {
      console.error('Failed to check AI status:', error)
      setIsEnabled(false)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await axios.get('/api/ai-assistant/history')
      if (res.data.chats && res.data.chats.length > 0) {
        const lastChat = res.data.chats[0]
        setMessages(lastChat.messages || [])
      }
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/ai-assistant/chat', {
        message: input,
        context: {
          currentPage: window.location.pathname,
          userAgent: navigator.userAgent,
        },
      })

      const aiMessage = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
        messageId: res.data.messageId,
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to get AI response')
    } finally {
      setLoading(false)
    }
  }

  const rateMessage = async (messageId, rating) => {
    try {
      await axios.post('/api/ai-assistant/rate', {
        messageId,
        rating,
      })
      
      setMessages(prev => prev.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, rated: rating }
          : msg
      ))
      
      toast.success('Thanks for your feedback!')
    } catch (error) {
      console.error('Failed to rate message:', error)
    }
  }

  if (!isEnabled) return null

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow z-50"
          >
            <Bot className="w-8 h-8" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI Assistant</h3>
                  <p className="text-xs text-purple-100">Always here to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-purple-500" />
                  <p className="font-semibold">Hi! I'm your AI assistant</p>
                  <p className="text-sm mt-2">Ask me anything about movies, navigation, or your account!</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-blue-500' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message */}
                  <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : msg.isError
                        ? 'bg-red-100 text-red-900'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Rating buttons for AI messages */}
                    {msg.role === 'assistant' && !msg.isError && msg.messageId && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => rateMessage(msg.messageId, 'helpful')}
                          disabled={msg.rated}
                          className={`text-xs flex items-center gap-1 ${
                            msg.rated === 'helpful' ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Helpful
                        </button>
                        <button
                          onClick={() => rateMessage(msg.messageId, 'not_helpful')}
                          disabled={msg.rated}
                          className={`text-xs flex items-center gap-1 ${
                            msg.rated === 'not_helpful' ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Not helpful
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
