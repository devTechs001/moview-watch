## 🚀 Advanced Features Implementation Guide

This document covers all the advanced features added to CinemaFlix Movie App including chatrooms, video calls, payment integrations, and more.

---

## 📋 New Features Overview

### ✅ Implemented:
1. **Chatrooms System** (Private/Public)
2. **Real-time Messaging** with Socket.io
3. **Video Call Infrastructure** (WebRTC ready)
4. **M-Pesa Payment Integration**
5. **PayPal Payment Integration**
6. **Enhanced User Profiles** with Contact Info
7. **Real-time Interactions** (Share/Like/Comment)
8. **Socket System** for all social features

### 📝 To Be Completed:
1. Enhanced Video Player Component
2. GitHub Pages Deployment Config
3. Multi-Admin Management System
4. Advanced Navigation Enhancements

---

## 1. 💬 Chatrooms System

### Backend Components Created:

#### Models:
- **`server/models/Chatroom.js`** - Chatroom schema with:
  - Public/Private/Group types
  - Member management
  - Role-based access (admin/moderator/member)
  - Settings (invites, approval, max members)
  
- **`server/models/Message.js`** - Message schema with:
  - Text/Image/Video/Audio/File types
  - Reactions system
  - Read receipts
  - Reply threading
  - Content sharing (movies, posts)

#### API Endpoints:

```
GET    /api/chatrooms/public             - Get all public chatrooms
GET    /api/chatrooms/my-chatrooms       - Get user's chatrooms
POST   /api/chatrooms                    - Create new chatroom
POST   /api/chatrooms/:id/join           - Join chatroom
POST   /api/chatrooms/:id/leave          - Leave chatroom
GET    /api/chatrooms/:id/messages       - Get chatroom messages
POST   /api/chatrooms/:id/messages       - Send message
POST   /api/chatrooms/messages/:id/react - React to message
DELETE /api/chatrooms/:id                - Delete chatroom
```

### Frontend Components:

#### Pages:
- **`client/src/pages/ChatroomsPage.jsx`** - Browse and create chatrooms
- **`client/src/pages/ChatroomView.jsx`** - Individual chatroom view with real-time messaging

#### Features:
- ✅ Create public/private chatrooms
- ✅ Join/leave chatrooms
- ✅ Real-time messaging
- ✅ Member list
- ✅ Search chatrooms
- ✅ Message reactions
- ✅ Typing indicators (infrastructure ready)

### Usage:

#### Create a Chatroom:
```javascript
// Frontend
const response = await axios.post('/chatrooms', {
  name: 'Movie Fans',
  description: 'Discuss latest movies',
  type: 'public'
})
```

#### Join a Chatroom:
```javascript
await axios.post(`/chatrooms/${roomId}/join`)
```

#### Send Message:
```javascript
await axios.post(`/chatrooms/${roomId}/messages`, {
  content: 'Hello everyone!',
  type: 'text'
})
```

---

## 2. 📹 Video Call System

### Socket.io Events (Server-side):

```javascript
// Start video call
socket.on('start-video-call', (data) => {...})

// Accept video call  
socket.on('accept-video-call', (data) => {...})

// Reject video call
socket.on('reject-video-call', (data) => {...})

// End video call
socket.on('end-video-call', (data) => {...})

// WebRTC signaling
socket.on('video-offer', (data) => {...})
socket.on('video-answer', (data) => {...})
socket.on('video-ice-candidate', (data) => {...})
```

### WebRTC Implementation (Frontend - To Add):

```javascript
// Create peer connection
const peerConnection = new RTCPeerConnection(config)

// Add local stream
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream)
})

// Handle incoming tracks
peerConnection.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0]
}

// Create and send offer
const offer = await peerConnection.createOffer()
await peerConnection.setLocalDescription(offer)
socket.emit('video-offer', { targetUserId, offer })
```

### Video Call Component (Template):

```jsx
// client/src/components/VideoCall.jsx
import { useRef, useEffect, useState } from 'react'
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react'

const VideoCall = ({ roomId, onEnd }) => {
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)

  useEffect(() => {
    // Initialize WebRTC
    initializeWebRTC()
  }, [])

  const initializeWebRTC = async () => {
    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    localVideoRef.current.srcObject = stream
    
    // Setup peer connection
    // ... WebRTC logic
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <video ref={remoteVideoRef} className="w-full h-full" autoPlay />
      <video 
        ref={localVideoRef} 
        className="absolute bottom-4 right-4 w-48 h-36 rounded-lg" 
        autoPlay 
        muted 
      />
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button onClick={() => setIsVideoOn(!isVideoOn)}>
          {isVideoOn ? <Video /> : <VideoOff />}
        </button>
        <button onClick={() => setIsAudioOn(!isAudioOn)}>
          {isAudioOn ? <Mic /> : <MicOff />}
        </button>
        <button onClick={onEnd} className="bg-red-500">
          <PhoneOff />
        </button>
      </div>
    </div>
  )
}
```

---

## 3. 💳 Payment Integrations

### A. M-Pesa Integration (Kenya)

**File:** `server/utils/mpesa.js`

#### Setup:
```env
# Add to .env
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASS_KEY=your_pass_key
MPESA_SHORT_CODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_ENV=sandbox  # or production
```

#### Usage:

```javascript
import mpesa from '../utils/mpesa.js'

// Initiate payment
const result = await mpesa.stkPush({
  amount: 100,
  phoneNumber: '254712345678',
  accountReference: 'SUB-123',
  transactionDesc: 'Premium Subscription'
})

// Query payment status
const status = await mpesa.queryStkPush(checkoutRequestId)
```

#### Callback Handler:
```javascript
app.post('/api/payments/mpesa/callback', (req, res) => {
  const result = mpesa.processCallback(req.body)
  
  if (result.success) {
    // Update subscription
    // Save transaction
  }
  
  res.json({ ResultCode: 0, ResultDesc: 'Success' })
})
```

### B. PayPal Integration

**File:** `server/utils/paypal.js`

#### Setup:
```env
# Add to .env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or live
```

#### Usage:

```javascript
import paypal from '../utils/paypal.js'

// Create order
const order = await paypal.createOrder({
  amount: 9.99,
  currency: 'USD',
  description: 'CinemaFlix Basic Subscription',
  returnUrl: 'https://yourdomain.com/subscription/success',
  cancelUrl: 'https://yourdomain.com/subscription/cancel'
})

// Capture payment
const capture = await paypal.captureOrder(orderId)

// Create subscription
const subscription = await paypal.createSubscription({
  planId: 'PLAN-123',
  returnUrl: 'https://yourdomain.com/subscription/success',
  cancelUrl: 'https://yourdomain.com/subscription/cancel'
})
```

### C. Payment Routes (To Add):

```javascript
// server/routes/paymentRoutes.js
import express from 'express'
import mpesa from '../utils/mpesa.js'
import paypal from '../utils/paypal.js'
import stripe from '../utils/stripe.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// M-Pesa
router.post('/mpesa/initiate', protect, async (req, res) => {
  const { amount, phoneNumber } = req.body
  const result = await mpesa.stkPush({
    amount,
    phoneNumber,
    accountReference: `USER-${req.user._id}`,
    transactionDesc: 'Subscription Payment'
  })
  res.json(result)
})

router.post('/mpesa/callback', async (req, res) => {
  const result = mpesa.processCallback(req.body)
  // Process payment...
  res.json({ ResultCode: 0 })
})

// PayPal
router.post('/paypal/create-order', protect, async (req, res) => {
  const { amount } = req.body
  const order = await paypal.createOrder({
    amount,
    currency: 'USD',
    description: 'Subscription Payment',
    returnUrl: `${process.env.CLIENT_URL}/payment/success`,
    cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`
  })
  res.json(order)
})

router.post('/paypal/capture/:orderId', protect, async (req, res) => {
  const capture = await paypal.captureOrder(req.params.orderId)
  // Update subscription...
  res.json(capture)
})

// Stripe (already implemented)
// ...

export default router
```

---

## 4. 👤 Enhanced User Profiles

### Updated User Model:

Added to `server/models/User.js`:

```javascript
contactInfo: {
  phone: String,
  whatsapp: String,
  telegram: String,
  twitter: String,
  instagram: String,
  facebook: String,
  website: String,
},
visibility: {
  showEmail: Boolean,
  showPhone: Boolean,
  showSocial: Boolean,
}
```

### Profile Update API:

```javascript
// Update profile with contact info
PUT /api/user/profile
{
  "bio": "Movie enthusiast",
  "location": "Nairobi, Kenya",
  "contactInfo": {
    "phone": "+254712345678",
    "whatsapp": "+254712345678",
    "twitter": "@username",
    "instagram": "@username"
  },
  "visibility": {
    "showEmail": false,
    "showPhone": true,
    "showSocial": true
  }
}
```

### Enhanced Profile Page (To Add):

```jsx
// client/src/pages/EnhancedProfilePage.jsx
const EnhancedProfilePage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <Avatar className="w-24 h-24" />
            <h1>{user.name}</h1>
            <p>{user.bio}</p>
            <p>{user.location}</p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            {visibility.showEmail && (
              <div>Email: {user.email}</div>
            )}
            {visibility.showPhone && (
              <div>Phone: {contactInfo.phone}</div>
            )}
            {visibility.showSocial && (
              <>
                <div>WhatsApp: {contactInfo.whatsapp}</div>
                <div>Telegram: {contactInfo.telegram}</div>
                <div>Twitter: {contactInfo.twitter}</div>
                <div>Instagram: {contactInfo.instagram}</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Contact Buttons */}
        <div className="flex gap-4 mt-6">
          <Button onClick={() => window.open(`https://wa.me/${contactInfo.whatsapp}`)}>
            <MessageCircle /> WhatsApp
          </Button>
          <Button onClick={() => window.open(`https://t.me/${contactInfo.telegram}`)}>
            <Send /> Telegram
          </Button>
          <Button onClick={() => window.location.href = `/chat?user=${user._id}`}>
            <MessageCircle /> Chat
          </Button>
        </div>
      </div>
    </Layout>
  )
}
```

---

## 5. 🔄 Real-time Interactions

### Socket.io Events for Social Features:

```javascript
// Share content
socket.emit('share-content', {
  contentType: 'movie',
  contentId: movieId
})

// Like content
socket.emit('like-content', {
  contentType: 'movie',
  contentId: movieId
})

// Comment on content
socket.emit('comment-content', {
  contentType: 'movie',
  contentId: movieId,
  comment: 'Great movie!'
})
```

### Frontend Usage:

```jsx
// In any component
import { useSocket } from '../hooks/useSocket'

const MovieCard = ({ movie }) => {
  const socket = useSocket()

  const handleLike = () => {
    socket.emit('like-content', {
      contentType: 'movie',
      contentId: movie._id
    })
  }

  const handleShare = () => {
    socket.emit('share-content', {
      contentType: 'movie',
      contentId: movie._id
    })
  }

  useEffect(() => {
    socket.on('content_liked', (data) => {
      if (data.contentId === movie._id) {
        // Update like count
      }
    })
  }, [])

  return (
    <Card>
      <img src={movie.poster} />
      <Button onClick={handleLike}>
        <Heart /> Like
      </Button>
      <Button onClick={handleShare}>
        <Share2 /> Share
      </Button>
    </Card>
  )
}
```

---

## 6. 🎬 Enhanced Video Player (To Implement)

### Required Component:

```jsx
// client/src/components/EnhancedVideoPlayer.jsx
import ReactPlayer from 'react-player'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'

const EnhancedVideoPlayer = ({ videoUrl, onProgress, onEnded }) => {
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [quality, setQuality] = useState('auto')
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={videoUrl}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackSpeed}
        onProgress={onProgress}
        onEnded={onEnded}
        width="100%"
        height="100%"
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setPlaying(!playing)}>
            {playing ? <Pause /> : <Play />}
          </button>
          
          <button onClick={() => setMuted(!muted)}>
            {muted ? <VolumeX /> : <Volume2 />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24"
          />

          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            <option value="auto">Auto</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
          </select>

          <select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>

          <button onClick={requestFullscreen}>
            <Maximize />
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. 🚀 GitHub Pages Deployment

### Create Deployment Config:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd client
        npm install
    
    - name: Build
      run: |
        cd client
        npm run build
      env:
        VITE_API_URL: ${{ secrets.API_URL }}
        VITE_SOCKET_URL: ${{ secrets.SOCKET_URL }}
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./client/dist
```

### Update Vite Config:

```javascript
// client/vite.config.js
export default {
  base: '/movie-app/',  // Your repo name
  build: {
    outDir: 'dist',
  },
}
```

### Add Homepage to package.json:

```json
{
  "homepage": "https://yourusername.github.io/movie-app"
}
```

---

## 8. 📝 Setup Instructions

### Install Required Packages:

```bash
# Backend
cd server
npm install axios  # For payment APIs

# Frontend
cd client
npm install react-player  # For video player
```

### Environment Variables:

Add to `server/.env`:

```env
# M-Pesa
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_PASS_KEY=your_pass_key
MPESA_SHORT_CODE=174379
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_ENV=sandbox

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox

# Already have Stripe
STRIPE_SECRET_KEY=sk_test_...
```

---

## 9. 🧪 Testing the Features

### Test Chatrooms:
1. Navigate to `/chatrooms`
2. Create a new public chatroom
3. Open the chatroom
4. Send messages
5. Open in another browser/incognito to test real-time

### Test Payments:

#### M-Pesa (Sandbox):
```javascript
// Use test phone number: 254708374149
const result = await mpesa.stkPush({
  amount: 1,
  phoneNumber: '254708374149',
  accountReference: 'TEST-123',
  transactionDesc: 'Test Payment'
})
```

#### PayPal (Sandbox):
- Use sandbox account credentials
- Test card: 4111 1111 1111 1111

### Test Video Calls:
1. Enable camera/microphone permissions
2. Start a call with another user
3. Test accept/reject/end call
4. Test video/audio toggle

---

## 10. 📊 Features Summary

| Feature | Status | Files |
|---------|--------|-------|
| Chatrooms | ✅ Complete | Chatroom.js, chatroomController.js, chatroomRoutes.js |
| Real-time Messaging | ✅ Complete | ChatroomView.jsx, Socket.io events |
| Video Call Infrastructure | ✅ Ready | Socket.io events, WebRTC template |
| M-Pesa Integration | ✅ Complete | mpesa.js |
| PayPal Integration | ✅ Complete | paypal.js |
| Stripe Integration | ✅ Complete | stripe.js (already done) |
| Enhanced Profiles | ✅ Complete | User.js updated |
| Real-time Interactions | ✅ Complete | Socket.io events |
| Video Player | 📝 Template provided | EnhancedVideoPlayer template |
| GitHub Pages | 📝 Config provided | deploy.yml template |

---

## 🎯 Next Steps

1. **Add Routes**: Update App.jsx with chatroom routes
2. **Payment Routes**: Create paymentRoutes.js
3. **Video Player**: Implement EnhancedVideoPlayer component
4. **Video Calls**: Complete WebRTC implementation
5. **Testing**: Test all payment methods
6. **Deployment**: Configure GitHub Actions

---

## 📞 Support & Resources

- M-Pesa Documentation: https://developer.safaricom.co.ke/
- PayPal Documentation: https://developer.paypal.com/
- WebRTC Guide: https://webrtc.org/getting-started/
- Socket.io Guide: https://socket.io/docs/

---

**Status: 🚀 READY FOR INTEGRATION**

All core infrastructure is complete. Frontend integration and testing required.
