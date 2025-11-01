import { useState } from 'react'
import { Download, Check, Loader2 } from 'lucide-react'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

export default function DownloadButton({ movieId, type = 'movie', title }) {
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [downloadLinks, setDownloadLinks] = useState(null)
  const [loading, setLoading] = useState(false)

  const getDownloadLinks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/movies/${movieId}/download`)
      setDownloadLinks(res.data.downloadLinks)
      setShowQualityMenu(true)
    } catch (error) {
      if (error.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
        toast.error('Active subscription required to download')
      } else {
        toast.error('Failed to get download links')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (quality, url) => {
    try {
      // Track download
      await axios.post(`/api/movies/${movieId}/download/track`, { quality })
      
      // Start download
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}-${quality}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success(`Downloading ${quality} quality`)
      setShowQualityMenu(false)
    } catch (error) {
      toast.error('Failed to start download')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={getDownloadLinks}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        Download
      </button>

      {showQualityMenu && downloadLinks && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowQualityMenu(false)}
          />

          {/* Quality Menu */}
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50 min-w-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Select Quality</h3>
              <button
                onClick={() => setShowQualityMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {downloadLinks.qualities.map((q) => (
                <button
                  key={q.quality}
                  onClick={() => handleDownload(q.quality, q.url)}
                  className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-lg">{q.quality}</span>
                      <p className="text-sm text-gray-500">{q.resolution}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{q.size}</p>
                      <p className="text-xs text-gray-500">{q.bitrate}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {downloadLinks.subtitles && downloadLinks.subtitles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold mb-2 text-sm">Subtitles</h4>
                <div className="space-y-1">
                  {downloadLinks.subtitles.map((sub) => (
                    <button
                      key={sub.language}
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = sub.url
                        link.download = `${title}-${sub.language}.srt`
                        link.click()
                        toast.success(`Downloading ${sub.language} subtitles`)
                      }}
                      className="block text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {sub.language}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              Link expires: {new Date(downloadLinks.expiresAt).toLocaleString()}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
