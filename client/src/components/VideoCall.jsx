import { useState, useEffect, useRef } from 'react'
import { Video as VideoIcon, VideoOff, Mic, MicOff, PhoneOff, Maximize, Minimize } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { getInitials, SOCKET_URL } from '../lib/utils'
import { useAuthStore } from '../store/authStore'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const VideoCall = ({ targetUser, onEnd, callType = 'video' }) => {
  const { user } = useAuthStore()
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video')
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callStatus, setCallStatus] = useState('connecting') // connecting, connected, ended
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)

  useEffect(() => {
    initializeCall()
    
    return () => {
      endCall()
    }
  }, [])

  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Setup Socket.io
      const socket = io(SOCKET_URL)
      socketRef.current = socket

      // Setup WebRTC
      setupPeerConnection(stream)

      // Socket listeners
      socket.on('video-offer', handleReceiveOffer)
      socket.on('video-answer', handleReceiveAnswer)
      socket.on('video-ice-candidate', handleReceiveIceCandidate)
      socket.on('video_call_ended', handleCallEnded)

      // Start call
      socket.emit('start-video-call', {
        targetUserId: targetUser._id,
        callerName: user.name,
        roomId: `call-${user._id}-${targetUser._id}`,
        callType
      })

      setCallStatus('connecting')
    } catch (error) {
      console.error('Failed to initialize call:', error)
      toast.error('Failed to access camera/microphone')
      onEnd()
    }
  }

  const setupPeerConnection = (stream) => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const peerConnection = new RTCPeerConnection(configuration)
    peerConnectionRef.current = peerConnection

    // Add local stream tracks
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream)
    })

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
        setCallStatus('connected')
      }
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('video-ice-candidate', {
          targetUserId: targetUser._id,
          candidate: event.candidate
        })
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'connected') {
        setCallStatus('connected')
        toast.success('Call connected!')
      } else if (peerConnection.connectionState === 'failed') {
        toast.error('Connection failed')
        endCall()
      }
    }

    // Create and send offer
    createAndSendOffer(peerConnection)
  }

  const createAndSendOffer = async (peerConnection) => {
    try {
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      socketRef.current.emit('video-offer', {
        targetUserId: targetUser._id,
        offer
      })
    } catch (error) {
      console.error('Failed to create offer:', error)
    }
  }

  const handleReceiveOffer = async ({ offer, from }) => {
    try {
      const peerConnection = peerConnectionRef.current
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      socketRef.current.emit('video-answer', {
        targetUserId: from,
        answer
      })
    } catch (error) {
      console.error('Failed to handle offer:', error)
    }
  }

  const handleReceiveAnswer = async ({ answer }) => {
    try {
      const peerConnection = peerConnectionRef.current
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    } catch (error) {
      console.error('Failed to handle answer:', error)
    }
  }

  const handleReceiveIceCandidate = async ({ candidate }) => {
    try {
      const peerConnection = peerConnectionRef.current
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    } catch (error) {
      console.error('Failed to add ICE candidate:', error)
    }
  }

  const handleCallEnded = () => {
    setCallStatus('ended')
    toast('Call ended')
    setTimeout(() => {
      onEnd()
    }, 1000)
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const endCall = () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.emit('end-video-call', {
        roomId: `call-${user._id}-${targetUser._id}`
      })
      socketRef.current.disconnect()
    }

    setCallStatus('ended')
    onEnd()
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {callStatus === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={targetUser.avatar} />
              <AvatarFallback className="text-2xl">
                {getInitials(targetUser.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-white text-lg mb-2">{targetUser.name}</p>
            <p className="text-gray-400">Connecting...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mt-4"></div>
          </div>
        )}

        {callStatus === 'ended' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <p className="text-white text-xl">Call Ended</p>
            </div>
          </div>
        )}

        {/* Call Info */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-black/50 border-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={targetUser.avatar} />
                  <AvatarFallback>{getInitials(targetUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold">{targetUser.name}</p>
                  <p className="text-gray-400 text-sm">
                    {callStatus === 'connected' ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </Card>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-24 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getInitials(user?.name || 'You')}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoOn ? 'default' : 'destructive'}
            className="rounded-full w-16 h-16"
          >
            {isVideoOn ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            onClick={toggleAudio}
            size="lg"
            variant={isAudioOn ? 'default' : 'destructive'}
            className="rounded-full w-16 h-16"
          >
            {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            onClick={endCall}
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VideoCall
