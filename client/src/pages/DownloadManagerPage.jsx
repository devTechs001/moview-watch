import { useState, useEffect } from 'react'
import { Download, Trash2, Play, Pause, CheckCircle, XCircle, Folder } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DownloadManagerPage() {
  const [downloads, setDownloads] = useState([])
  const [filter, setFilter] = useState('all') // all, completed, downloading, failed

  useEffect(() => {
    loadDownloads()
  }, [])

  const loadDownloads = () => {
    // Load from localStorage
    const saved = localStorage.getItem('downloads')
    if (saved) {
      setDownloads(JSON.parse(saved))
    }
  }

  const saveDownloads = (newDownloads) => {
    localStorage.setItem('downloads', JSON.stringify(newDownloads))
    setDownloads(newDownloads)
  }

  const removeDownload = (id) => {
    const updated = downloads.filter(d => d.id !== id)
    saveDownloads(updated)
    toast.success('Download removed')
  }

  const clearCompleted = () => {
    const updated = downloads.filter(d => d.status !== 'completed')
    saveDownloads(updated)
    toast.success('Completed downloads cleared')
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all downloads?')) {
      saveDownloads([])
      toast.success('All downloads cleared')
    }
  }

  const filteredDownloads = downloads.filter(d => {
    if (filter === 'all') return true
    return d.status === filter
  })

  const stats = {
    total: downloads.length,
    completed: downloads.filter(d => d.status === 'completed').length,
    downloading: downloads.filter(d => d.status === 'downloading').length,
    failed: downloads.filter(d => d.status === 'failed').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Download Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your downloaded movies, music, and shorts
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Downloading</p>
            <p className="text-2xl font-bold text-blue-600">{stats.downloading}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'completed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('downloading')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'downloading'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Downloading
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'failed'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Failed
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearCompleted}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Clear Completed
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Downloads List */}
        <div className="space-y-3">
          {filteredDownloads.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
              <Download className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No downloads yet
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Start downloading movies, music, or shorts to see them here
              </p>
            </div>
          ) : (
            filteredDownloads.map((download) => (
              <div
                key={download.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-4"
              >
                {/* Thumbnail */}
                <img
                  src={download.thumbnail}
                  alt={download.title}
                  className="w-24 h-16 object-cover rounded"
                />

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{download.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{download.quality}</span>
                    <span>•</span>
                    <span>{download.size}</span>
                    <span>•</span>
                    <span className="capitalize">{download.type}</span>
                  </div>

                  {/* Progress Bar */}
                  {download.status === 'downloading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 transition-all"
                          style={{ width: `${download.progress || 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {download.progress || 0}% • {download.speed || '0 MB/s'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Icon */}
                <div>
                  {download.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {download.status === 'downloading' && (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {download.status === 'failed' && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {download.status === 'completed' && (
                    <button
                      onClick={() => {
                        // Open file location
                        toast.info('Opening download location...')
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Open file location"
                    >
                      <Folder className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={() => removeDownload(download.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
