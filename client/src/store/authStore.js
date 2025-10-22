import { create } from 'zustand'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        set({ isAuthenticated: false, isLoading: false })
        return
      }

      const response = await axios.get('/auth/me')
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      localStorage.setItem('token', response.data.token)
      set({ user: response.data.user, isAuthenticated: true })
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
      return false
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData)
      localStorage.setItem('token', response.data.token)
      set({ user: response.data.user, isAuthenticated: true })
      toast.success('Registration successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
    toast.success('Logged out successfully')
  },

  updateUser: (userData) => {
    set({ user: userData })
  },
}))
