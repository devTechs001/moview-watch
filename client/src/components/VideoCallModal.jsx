import { useState, useEffect, useRef } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { getInitials } from '../lib/utils'
import socket from '../lib/socket'

const VideoCallModal = ({ isOpen, onClose, recipientId, recipientName, recipientAvatar, isIncoming, callerId }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [callAccepted, setCallAccepted] = useState(false)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const peerConnection = useRef(null)
  const localStream = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setupMediaDevices()

    socket.onCallAccepted(() => {
      setCallAccepted(true)
      createPeerConnection()
    })

    socket.onOffer(handleOffer)
    socket.onAnswer(handleAnswer)
    socket.onIceCandidate(handleIceCandidate)

    return () => {
      cleanup()
    }
  }, [isOpen])

  const setupMediaDevices = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      
      localStream.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  const createPeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    }

    peerConnection.current = new RTCPeerConnection(configuration)

    localStream.current?.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current)
    })

    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.sendIceCandidate({
          recipientId: recipientId || callerId,
          candidate: event.candidate,
        })
      }
    }

    if (!isIncoming) {
      createOffer()
    }
  }

  const createOffer = async () => {
    const offer = await peerConnection.current.createOffer()
    await peerConnection.current.setLocalDescription(offer)
    
    socket.sendOffer({
      recipientId,
      offer,
    })
  }

  const handleOffer = async (data) => {
    if (!peerConnection.current) {
      createPeerConnection()
    }
    
    await peerConnection.current.setRemoteDescription(data.offer)
    const answer = await peerConnection.current.createAnswer()
    await peerConnection.current.setLocalDescription(answer)
    
    socket.sendAnswer({
      recipientId: data.callerId,
      answer,
    })
  }

  const handleAnswer = async (data) => {
    await peerConnection.current.setRemoteDescription(data.answer)
  }

  const handleIceCandidate = async (data) => {
    if (peerConnection.current) {
      await peerConnection.current.addIceCandidate(data.candidate)
    }
  }

  const handleAcceptCall = () => {
    socket.acceptCall({ callerId })
    setCallAccepted(true)
    createPeerConnection()
  }

  const handleRejectCall = () => {
    socket.rejectCall({ callerId })
    onClose()
  }

  const handleEndCall = () => {
    socket.endCall({ recipientId: recipientId || callerId })
    cleanup()
    onClose()
  }

  const toggleVideo = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoEnabled(videoTrack.enabled)
    }
  }

  const toggleAudio = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsAudioEnabled(audioTrack.enabled)
    }
  }

  const cleanup = () => {
    localStream.current?.getTracks().forEach((track) => track.stop())
    peerConnection.current?.close()
    localStream.current = null
    peerConnection.current = null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Remote Video (Large) */}
      <div className="flex-1 relative">
        {callAccepted ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={recipientAvatar} />
                <AvatarFallback>{getInitials(recipientName)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-2">{recipientName}</h2>
              <p className="text-gray-400">
                {isIncoming ? 'Incoming call...' : 'Calling...'}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Small - Picture in Picture) */}
        <div className="absolute top-4 right-4 w-40 h-30 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-6">
        <div className="flex items-center justify-center gap-4">
          {callAccepted && (
            <>
              <Button
                onClick={toggleVideo}
                variant={isVideoEnabled ? 'default' : 'destructive'}
                size="icon"
                className="w-14 h-14 rounded-full"
              >
                {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              </Button>

              <Button
                onClick={toggleAudio}
                variant={isAudioEnabled ? 'default' : 'destructive'}
                size="icon"
                className="w-14 h-14 rounded-full"
              >
                {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </Button>
            </>
          )}

          {isIncoming && !callAccepted ? (
            <>
              <Button
                onClick={handleAcceptCall}
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600"
                size="icon"
              >
                <Phone className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleRejectCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600"
                size="icon"
              >
                <X className="w-6 h-6" />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEndCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600"
              size="icon"
            >
              <Phone className="w-6 h-6 rotate-135" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoCallModal
