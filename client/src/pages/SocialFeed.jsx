import { useState, useEffect } from 'react'
import { Users, Heart, MessageCircle, Eye, Share2, TrendingUp, Plus } from 'lucide-react'
import Layout from '../components/Layout'
import { Card, CardContent } from '../components/ui/Card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import axios from '../lib/axios'
import { getInitials, formatDate } from '../lib/utils'

const SocialFeed = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const response = await axios.get('/social/feed')
      setActivities(response.data.activities || [])
    } catch (error) {
      console.error(error)
      setActivities(generateDemoActivities())
    } finally {
      setLoading(false)
    }
  }

  const generateDemoActivities = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      _id: i,
      user: { name: `User ${i}`, avatar: '' },
      type: ['watched', 'liked', 'rated', 'commented'][i % 4],
      movie: { title: `Movie ${i}`, poster: `https://picsum.photos/seed/social${i}/100/150` },
      createdAt: new Date(Date.now() - i * 3600000),
    }))
  }

  const getActivityIcon = (type) => {
    const icons = {
      watched: <Eye className="w-5 h-5 text-blue-500" />,
      liked: <Heart className="w-5 h-5 text-red-500 fill-red-500" />,
      rated: <TrendingUp className="w-5 h-5 text-green-500" />,
      commented: <MessageCircle className="w-5 h-5 text-purple-500" />,
    }
    return icons[type] || icons.watched
  }

  const getActivityText = (activity) => {
    const texts = {
      watched: `watched "${activity.movie?.title}"`,
      liked: `liked "${activity.movie?.title}"`,
      rated: `rated "${activity.movie?.title}"`,
      commented: `commented on "${activity.movie?.title}"`,
    }
    return texts[activity.type] || 'performed an action'
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Social Feed</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
            <Plus className="w-5 h-5" />
            Post
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><div className="h-20 bg-secondary animate-pulse rounded" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity._id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar><AvatarImage src={activity.user?.avatar} /><AvatarFallback>{getInitials(activity.user?.name || 'U')}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityIcon(activity.type)}
                        <span className="font-semibold">{activity.user?.name}</span>
                        <span className="text-muted-foreground">{getActivityText(activity)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default SocialFeed
