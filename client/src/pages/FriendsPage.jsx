import { useState, useEffect } from 'react'
import { UserPlus, Check, X, Users, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import { getInitials } from '../lib/utils'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const FriendsPage = () => {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        axios.get('/friends/list'),
        axios.get('/friends/requests')
      ])
      setFriends(friendsRes.data.friends || [])
      setRequests(requestsRes.data.requests || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await axios.put(`/friends/request/${requestId}/accept`)
      toast.success('Friend request accepted!')
      fetchData()
    } catch (error) {
      toast.error('Failed to accept request')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await axios.put(`/friends/request/${requestId}/reject`)
      toast.success('Friend request rejected')
      fetchData()
    } catch (error) {
      toast.error('Failed to reject request')
    }
  }

  const handleChat = (friendId) => {
    navigate(`/chat/${friendId}`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gradient">Friends</h1>
          <p className="text-muted-foreground">Connect and chat with your movie buddies</p>
        </div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <Card elevated className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Friend Requests ({requests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                        <AvatarImage src={request.from?.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-white font-semibold">{getInitials(request.from?.name || 'U')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{request.from?.name}</p>
                        <p className="text-sm text-muted-foreground">{request.from?.bio}</p>
                        {request.message && (
                          <p className="text-sm mt-1 italic">"{request.message}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request._id)}
                        className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request._id)}
                        className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Friends List */}
        <Card elevated>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Friends ({friends.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No friends yet</p>
                <p className="text-sm">Start connecting with other users!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friend) => (
                  <div key={friend._id} className="p-5 border-2 border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-200 bg-card hover:bg-accent/30">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-14 h-14 ring-2 ring-primary/20 hover:ring-primary transition-all">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-gradient-primary text-white font-semibold">{getInitials(friend.name || 'U')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{friend.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{friend.bio}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => navigate(`/profile/${friend._id}`)}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 shadow-md hover:shadow-lg transition-all"
                        onClick={() => handleChat(friend._id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default FriendsPage
