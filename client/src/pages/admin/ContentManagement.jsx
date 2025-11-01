import { useState, useEffect } from 'react'
import { Film, Video, Music, Sparkles, Plus, Edit, Trash2, Eye, EyeOff, Check, X } from 'lucide-react'
import axios from '../../lib/axios'
import toast from 'react-hot-toast'

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState('movies')
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  const tabs = [
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'shorts', label: 'Shorts', icon: Video },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'animations', label: 'Animations', icon: Sparkles },
  ]

  useEffect(() => {
    fetchContent()
  }, [activeTab])

  const fetchContent = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      switch (activeTab) {
        case 'movies':
          endpoint = '/api/movies'
          break
        case 'shorts':
          endpoint = '/api/library/shorts'
          break
        case 'music':
          endpoint = '/api/library/music'
          break
        case 'animations':
          endpoint = '/api/library/animations'
          break
      }

      const res = await axios.get(endpoint)
      setContent(res.data[activeTab] || res.data.movies || [])
    } catch (error) {
      console.error('Failed to fetch content:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const deleteContent = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      await axios.delete(`/api/library/${activeTab}/${id}`)
      toast.success('Content deleted successfully')
      fetchContent()
    } catch (error) {
      toast.error('Failed to delete content')
    }
  }

  const toggleVisibility = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/library/${activeTab}/${id}`, {
        isPublic: !currentStatus
      })
      toast.success('Visibility updated')
      fetchContent()
    } catch (error) {
      toast.error('Failed to update visibility')
    }
  }

  const approveContent = async (id) => {
    try {
      await axios.patch(`/api/library/${activeTab}/${id}/approve`)
      toast.success('Content approved')
      fetchContent()
    } catch (error) {
      toast.error('Failed to approve content')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all your platform content
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Add Content
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views/Plays
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : content.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No content found
                  </td>
                </tr>
              ) : (
                content.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.poster || item.coverImage || item.thumbnail}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            {item.artist || item.uploader?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{item.type || activeTab}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === 'active' || item.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status || 'active'}
                        </span>
                        {item.isPublic !== undefined && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.isPublic
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.isPublic ? 'Public' : 'Private'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.views || item.plays || 0}
                    </td>
                    <td className="px-6 py-4">
                      {item.likes?.length || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => approveContent(item._id)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => toggleVisibility(item._id, item.isPublic)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                          title={item.isPublic ? 'Make Private' : 'Make Public'}
                        >
                          {item.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {/* Edit modal */}}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteContent(item._id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
          <p className="text-2xl font-bold">{content.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {content.filter(c => c.status === 'active' || c.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {content.filter(c => c.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
          <p className="text-2xl font-bold text-blue-600">
            {content.reduce((sum, c) => sum + (c.views || c.plays || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  )
}
