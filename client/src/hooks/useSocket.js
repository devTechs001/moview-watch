import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import socket from '../lib/socket'

export const useSocket = () => {
  const { user, token } = useAuthStore()

  useEffect(() => {
    if (token && user) {
      socket.connect(token)
      
      // Join appropriate rooms
      socket.joinChat(user._id)
      
      if (user.role === 'admin') {
        socket.emit('join-admin', user._id)
      }

      return () => {
        socket.cleanup()
      }
    }
  }, [token, user])

  return socket
}
