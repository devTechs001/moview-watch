import io from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect(token) {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id)
    })

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Real-time notifications
  onNotification(callback) {
    this.on('notification', callback)
  }

  // Real-time new user registration
  onNewUser(callback) {
    this.on('new_user_registered', callback)
  }

  // Real-time posts
  onNewPost(callback) {
    this.on('new_post', callback)
  }

  onPostLike(callback) {
    this.on('post_liked', callback)
  }

  onPostComment(callback) {
    this.on('post_commented', callback)
  }

  // Real-time stories
  onNewStory(callback) {
    this.on('new_story', callback)
  }

  // Real-time chat
  joinChat(userId) {
    this.emit('join-chat', userId)
  }

  sendMessage(data) {
    this.emit('send-message', data)
  }

  onReceiveMessage(callback) {
    this.on('receive-message', callback)
  }

  onTyping(callback) {
    this.on('user-typing', callback)
  }

  sendTyping(recipientId) {
    this.emit('typing', { recipientId })
  }

  // Video call
  initiateCall(data) {
    this.emit('initiate-call', data)
  }

  onIncomingCall(callback) {
    this.on('incoming-call', callback)
  }

  acceptCall(data) {
    this.emit('accept-call', data)
  }

  onCallAccepted(callback) {
    this.on('call-accepted', callback)
  }

  rejectCall(data) {
    this.emit('reject-call', data)
  }

  endCall(data) {
    this.emit('end-call', data)
  }

  onCallEnded(callback) {
    this.on('call-ended', callback)
  }

  // WebRTC signaling
  sendOffer(data) {
    this.emit('webrtc-offer', data)
  }

  onOffer(callback) {
    this.on('webrtc-offer', callback)
  }

  sendAnswer(data) {
    this.emit('webrtc-answer', data)
  }

  onAnswer(callback) {
    this.on('webrtc-answer', callback)
  }

  sendIceCandidate(data) {
    this.emit('ice-candidate', data)
  }

  onIceCandidate(callback) {
    this.on('ice-candidate', callback)
  }

  // Admin monitoring
  onAdminAlert(callback) {
    this.on('admin_alert', callback)
  }

  onContentNeedsApproval(callback) {
    this.on('content_needs_approval', callback)
  }

  approveContent(contentId) {
    this.emit('approve_content', { contentId })
  }

  rejectContent(contentId, reason) {
    this.emit('reject_content', { contentId, reason })
  }

  // Generic event handlers
  on(event, callback) {
    if (!this.socket) return
    this.socket.on(event, callback)
    
    // Store listeners for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (!this.socket) return
    this.socket.off(event, callback)
  }

  emit(event, data) {
    if (!this.socket) return
    this.socket.emit(event, data)
  }

  cleanup() {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.off(event, callback)
      })
    })
    this.listeners.clear()
  }
}

export default new SocketService()
