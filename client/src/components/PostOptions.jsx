import { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Flag, Copy, Link as LinkIcon, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import toast from 'react-hot-toast'

const PostOptions = ({ post, currentUser, onEdit, onDelete, onReport }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const isOwnPost = currentUser?._id === post.user?._id

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/post/${post._id}`
    navigator.clipboard.writeText(postUrl)
    toast.success('Link copied to clipboard!')
    setShowMenu(false)
  }

  const handleEdit = () => {
    onEdit(post)
    setShowMenu(false)
  }

  const handleDelete = () => {
    setShowDeleteConfirm(true)
    setShowMenu(false)
  }

  const confirmDelete = () => {
    onDelete(post._id)
    setShowDeleteConfirm(false)
    toast.success('Post deleted')
  }

  const handleReport = () => {
    setShowReportDialog(true)
    setShowMenu(false)
  }

  const submitReport = () => {
    if (!reportReason.trim()) {
      toast.error('Please select a reason')
      return
    }
    onReport(post._id, reportReason)
    setShowReportDialog(false)
    setReportReason('')
    toast.success('Post reported')
  }

  return (
    <div className="relative">
      {/* Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowMenu(!showMenu)}
        className="hover:bg-secondary"
      >
        <MoreVertical className="w-5 h-5" />
      </Button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <Card className="absolute right-0 top-10 z-50 w-56 shadow-xl">
            <CardContent className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy link
                </Button>

                {isOwnPost ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleEdit}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit post
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete post
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleReport}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report post
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Delete Post?</h3>
              <p className="text-muted-foreground mb-6">
                This action cannot be undone. Your post will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Report Post</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReportDialog(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-4">
                Why are you reporting this post?
              </p>

              <div className="space-y-2 mb-6">
                {[
                  'Spam',
                  'Inappropriate content',
                  'Harassment or bullying',
                  'False information',
                  'Violence or dangerous content',
                  'Hate speech',
                  'Other',
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      reportReason === reason
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReportDialog(false)
                    setReportReason('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReport}
                  disabled={!reportReason}
                >
                  Submit Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PostOptions
