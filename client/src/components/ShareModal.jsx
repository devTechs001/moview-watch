import { useState, useEffect } from 'react'
import { Copy, Check, Share2, Link as LinkIcon, Facebook, Twitter, MessageCircle, Send, Clock, Users, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const ShareModal = ({ type, targetId, title, onClose }) => {
  const [inviteLink, setInviteLink] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [maxUses, setMaxUses] = useState(null)
  const [expiresIn, setExpiresIn] = useState(null)

  const createInviteLink = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/invite/create', {
        type,
        targetId,
        maxUses: maxUses || null,
        expiresIn: expiresIn || null,
        metadata: { title },
      })

      setInviteLink(response.data.inviteUrl)
      toast.success('Invite link created!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create invite link')
    } finally {
      setLoading(false)
    }
  }

  const createPublicShare = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/invite/share', {
        type,
        targetId,
        metadata: { title },
      })

      setInviteLink(response.data.shareUrl)
      toast.success('Share link created!')
    } catch (error) {
      toast.error('Failed to create share link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToSocial = (platform) => {
    const encodedUrl = encodeURIComponent(inviteLink)
    const encodedTitle = encodeURIComponent(title)
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share {type === 'chatroom' ? 'Chatroom' : 'Movie'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!inviteLink ? (
            <>
              <div>
                <h3 className="font-semibold mb-3">Create Invite Link</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a custom invite link with optional settings
                </p>

                {type === 'chatroom' && (
                  <>
                    <div className="space-y-3 mb-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          <Users className="w-4 h-4 inline mr-1" />
                          Max Uses (Optional)
                        </label>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          value={maxUses || ''}
                          onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : null)}
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Expires In (Hours)
                        </label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={expiresIn || ''}
                          onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Never</option>
                          <option value="1">1 Hour</option>
                          <option value="6">6 Hours</option>
                          <option value="24">24 Hours</option>
                          <option value="168">7 Days</option>
                          <option value="720">30 Days</option>
                        </select>
                      </div>
                    </div>
                    <Button
                      onClick={createInviteLink}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Creating...' : 'Create Invite Link'}
                    </Button>
                  </>
                )}

                {type === 'movie' && (
                  <Button
                    onClick={createPublicShare}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Create Share Link'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Share Link</label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="icon"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Share via</label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('facebook')}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Facebook className="w-5 h-5 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('twitter')}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('whatsapp')}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial('telegram')}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                  >
                    <Send className="w-5 h-5 text-blue-500" />
                    <span className="text-xs">Telegram</span>
                  </Button>
                </div>
              </div>

              {type === 'chatroom' && (maxUses || expiresIn) && (
                <div className="p-3 bg-secondary rounded-lg">
                  <p className="text-sm font-medium mb-1">Link Settings:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {maxUses && <li>• Max uses: {maxUses}</li>}
                    {expiresIn && <li>• Expires in: {expiresIn} hours</li>}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setInviteLink(null)
                    setMaxUses(null)
                    setExpiresIn(null)
                  }}
                  className="flex-1"
                >
                  Create New
                </Button>
                <Button onClick={onClose} className="flex-1">
                  Done
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ShareModal
