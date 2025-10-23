import { useState, useRef } from 'react'
import { Camera, Video, Image as ImageIcon, X, Upload, Play, Pause, StopCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import toast from 'react-hot-toast'

const MediaUpload = ({ onMediaSelect, onClose }) => {
  const [mode, setMode] = useState(null) // 'photo', 'video', 'upload'
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  // Start camera for photo
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode('photo')
    } catch (error) {
      toast.error('Camera access denied')
      console.error('Camera error:', error)
    }
  }

  // Start camera for video recording
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: true 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setMode('video')
    } catch (error) {
      toast.error('Camera/microphone access denied')
      console.error('Recording error:', error)
    }
  }

  // Take photo
  const takePhoto = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      setPreviewUrl(URL.createObjectURL(blob))
      setMediaType('image')
      stopCamera()
      onMediaSelect(file, 'image')
    }, 'image/jpeg', 0.95)
  }

  // Start recording video
  const startRecording = () => {
    setRecordedChunks([])
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9'
    })
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data])
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' })
      setPreviewUrl(URL.createObjectURL(blob))
      setMediaType('video')
      stopCamera()
      onMediaSelect(file, 'video')
    }
    
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  // Pause/Resume recording
  const togglePauseRecording = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : 'video'
      setPreviewUrl(URL.createObjectURL(file))
      setMediaType(type)
      setMode('upload')
      onMediaSelect(file, type)
    }
  }

  // Close and cleanup
  const handleClose = () => {
    stopCamera()
    stopRecording()
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Add Media</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Mode Selection */}
          {!mode && !previewUrl && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-32 flex-col gap-3 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={startCamera}
              >
                <Camera className="w-12 h-12" />
                <span className="font-semibold">Take Photo</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-3 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={startVideoRecording}
              >
                <Video className="w-12 h-12" />
                <span className="font-semibold">Record Video</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-32 flex-col gap-3 hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12" />
                <span className="font-semibold">Upload File</span>
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera/Video Preview */}
          {(mode === 'photo' || mode === 'video') && !previewUrl && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-semibold">
                      {isPaused ? 'Paused' : 'Recording'}
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Controls */}
              {mode === 'photo' && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleClose} variant="outline">
                    Cancel
                  </Button>
                  <Button onClick={takePhoto} size="lg" className="px-8">
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </Button>
                </div>
              )}

              {/* Video Controls */}
              {mode === 'video' && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleClose} variant="outline">
                    Cancel
                  </Button>
                  
                  {!isRecording ? (
                    <Button onClick={startRecording} size="lg" className="px-8">
                      <Video className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={togglePauseRecording} 
                        variant="outline"
                        size="lg"
                      >
                        {isPaused ? (
                          <><Play className="w-5 h-5 mr-2" /> Resume</>
                        ) : (
                          <><Pause className="w-5 h-5 mr-2" /> Pause</>
                        )}
                      </Button>
                      <Button 
                        onClick={stopRecording} 
                        variant="destructive"
                        size="lg"
                      >
                        <StopCircle className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {mediaType === 'image' ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <video src={previewUrl} controls className="w-full h-full object-contain" />
                )}
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setPreviewUrl(null)
                    setMode(null)
                    setMediaType(null)
                  }} 
                  variant="outline"
                >
                  Retake
                </Button>
                <Button onClick={handleClose} className="px-8">
                  Use This {mediaType === 'image' ? 'Photo' : 'Video'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MediaUpload
