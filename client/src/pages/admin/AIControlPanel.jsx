import { useState, useEffect } from 'react'
import { Bot, MessageCircle, Sparkles, TrendingUp, Shield, BarChart, Settings } from 'lucide-react'
import axios from '../../lib/axios'
import toast from 'react-hot-toast'

export default function AIControlPanel() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchSettings()
    fetchStats()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/ai-assistant/settings')
      setSettings(res.data.settings || {})
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load AI settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/ai-assistant/history')
      setStats({
        totalChats: res.data.chats?.length || 0,
        totalMessages: res.data.chats?.reduce((sum, chat) => sum + (chat.messages?.length || 0), 0) || 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const toggleFeature = async (feature) => {
    try {
      const res = await axios.put(`/api/ai-assistant/toggle/${feature}`, {
        enabled: !settings[feature]?.enabled
      })
      
      setSettings(res.data.settings)
      
      const status = res.data.settings[feature].enabled ? 'enabled' : 'disabled'
      toast.success(`AI ${feature} ${status}`)
    } catch (error) {
      console.error('Failed to toggle feature:', error)
      toast.error('Failed to update feature')
    }
  }

  const features = [
    {
      id: 'assistant',
      name: 'AI Chat Assistant',
      description: 'Chat widget for users to get help and recommendations',
      icon: Bot,
      color: 'purple',
    },
    {
      id: 'recommendations',
      name: 'AI Recommendations',
      description: 'Personalized movie and content recommendations',
      icon: Sparkles,
      color: 'blue',
    },
    {
      id: 'learning',
      name: 'AI Learning',
      description: 'Collect data to improve AI accuracy',
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: 'monitoring',
      name: 'AI Monitoring',
      description: 'Security threat detection and prevention',
      icon: Shield,
      color: 'red',
    },
    {
      id: 'analytics',
      name: 'AI Analytics',
      description: 'Advanced analytics and insights',
      icon: BarChart,
      color: 'yellow',
    },
  ]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading AI settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Control Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all AI features and settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Chats</p>
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">{stats.totalChats}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{stats.totalMessages}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Features</p>
            <Settings className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            {Object.values(settings).filter(s => s?.enabled).length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">1.2s</p>
        </div>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => {
          const isEnabled = settings[feature.id]?.enabled || false
          const Icon = feature.icon

          return (
            <div
              key={feature.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleFeature(feature.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <h3 className="text-lg font-bold mb-2">{feature.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isEnabled ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium">
                  {isEnabled ? 'Active' : 'Inactive'}
                </span>
              </div>

              {feature.id === 'assistant' && isEnabled && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-800 dark:text-green-400">
                    ✓ Users can see the AI chat widget
                  </p>
                </div>
              )}

              {feature.id === 'assistant' && !isEnabled && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ✗ AI chat widget is hidden from users
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
        <p className="mb-4 opacity-90">
          Manage AI features quickly
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => {
              features.forEach(f => {
                if (!settings[f.id]?.enabled) {
                  toggleFeature(f.id)
                }
              })
            }}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Enable All
          </button>

          <button
            onClick={() => {
              features.forEach(f => {
                if (settings[f.id]?.enabled) {
                  toggleFeature(f.id)
                }
              })
            }}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition"
          >
            Disable All
          </button>

          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  )
}
