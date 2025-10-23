import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Users, Film, Clock, Link as LinkIcon } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import axios from '../lib/axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { getInitials } from '../lib/utils'

const InvitePage = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [inviteDetails, setInviteDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchInviteDetails()
  }, [code])

  const fetchInviteDetails = async () => {
    try {
      const response = await axios.get(`/invite/${code}/details`)
      setInviteDetails(response.data.inviteLink)
    } catch (error) {
      console.error(error)
      setError(error.response?.data?.message || 'Invalid or expired invite link')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!user) {
      toast.error('Please login to accept this invite')
      navigate(`/login?redirect=/invite/${code}`)
      return
    }

    setAccepting(true)
    try {
      const response = await axios.post(`/invite/${code}/use`)
      toast.success(response.data.message)
      
      // Redirect to the appropriate page
      if (response.data.redirectTo) {
        navigate(response.data.redirectTo)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept invite')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Invalid Invite</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate('/')}>Go Home</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">You've Been Invited!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invite Info */}
            <div className="text-center">
              {inviteDetails?.type === 'chatroom' && inviteDetails?.target?.avatar && (
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={inviteDetails.target.avatar} />
                  <AvatarFallback>{getInitials(inviteDetails.metadata?.title || 'Room')}</AvatarFallback>
                </Avatar>
              )}
              {inviteDetails?.type === 'movie' && inviteDetails?.target?.poster && (
                <img
                  src={inviteDetails.target.poster}
                  alt={inviteDetails.metadata?.title}
                  className="w-48 h-64 mx-auto rounded-lg object-cover mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">{inviteDetails?.metadata?.title}</h2>
              <p className="text-muted-foreground mb-4">{inviteDetails?.metadata?.description}</p>
            </div>

            {/* Invite Type */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              {inviteDetails?.type === 'chatroom' && (
                <>
                  <Users className="w-4 h-4" />
                  <span>Chatroom Invitation</span>
                </>
              )}
              {inviteDetails?.type === 'movie' && (
                <>
                  <Film className="w-4 h-4" />
                  <span>Movie Share</span>
                </>
              )}
            </div>

            {/* Invited By */}
            {inviteDetails?.createdBy && (
              <div className="flex items-center justify-center gap-3 p-4 bg-secondary rounded-lg">
                <Avatar>
                  <AvatarImage src={inviteDetails.createdBy.avatar} />
                  <AvatarFallback>{getInitials(inviteDetails.createdBy.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Invited by</p>
                  <p className="font-semibold">{inviteDetails.createdBy.name}</p>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {inviteDetails?.maxUses && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <p className="text-2xl font-bold">{inviteDetails.maxUses - inviteDetails.usedCount}</p>
                  <p className="text-sm text-muted-foreground">Uses Remaining</p>
                </div>
              )}
              {inviteDetails?.expiresAt && (
                <div className="text-center p-3 bg-secondary rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">
                    Expires {new Date(inviteDetails.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAcceptInvite}
                disabled={accepting}
                className="flex-1"
                size="lg"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                size="lg"
              >
                Cancel
              </Button>
            </div>

            {!user && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need an account?{' '}
                  <button
                    onClick={() => navigate(`/register?redirect=/invite/${code}`)}
                    className="text-primary hover:underline"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default InvitePage
