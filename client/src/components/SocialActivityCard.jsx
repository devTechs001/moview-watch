import { Heart, MessageCircle, Eye, Star, Bookmark, Share2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { Card, CardContent } from './ui/Card'
import { getInitials, formatDate } from '../lib/utils'
import { Link } from 'react-router-dom'

const SocialActivityCard = ({ activity }) => {
  const getActivityIcon = (type) => {
    const icons = {
      watched: <Eye className="w-5 h-5 text-blue-500" />,
      liked: <Heart className="w-5 h-5 text-red-500 fill-red-500" />,
      rated: <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />,
      commented: <MessageCircle className="w-5 h-5 text-purple-500" />,
      shared: <Share2 className="w-5 h-5 text-green-500" />,
      added_to_wishlist: <Bookmark className="w-5 h-5 text-orange-500" />,
    }
    return icons[type] || icons.watched
  }

  const getActivityText = (activity) => {
    const texts = {
      watched: 'watched',
      liked: 'liked',
      rated: 'rated',
      commented: 'commented on',
      shared: 'shared',
      added_to_wishlist: 'added to wishlist',
    }
    return texts[activity.type] || 'interacted with'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Link to={`/profile/${activity.user?._id}`}>
            <Avatar className="w-12 h-12">
              <AvatarImage src={activity.user?.avatar} />
              <AvatarFallback>{getInitials(activity.user?.name || 'User')}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {getActivityIcon(activity.type)}
                <Link to={`/profile/${activity.user?._id}`} className="font-semibold hover:underline">
                  {activity.user?.name}
                </Link>
                <span className="text-muted-foreground">
                  {getActivityText(activity)}
                </span>
                {activity.movie && (
                  <Link to={`/movie/${activity.movie._id}`} className="font-semibold text-primary hover:underline">
                    "{activity.movie.title}"
                  </Link>
                )}
              </div>
            </div>

            {activity.rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{activity.rating}/10</span>
              </div>
            )}

            {activity.movie?.poster && (
              <Link to={`/movie/${activity.movie._id}`}>
                <img
                  src={activity.movie.poster}
                  alt={activity.movie.title}
                  className="w-32 h-48 object-cover rounded-lg mt-2"
                />
              </Link>
            )}

            <p className="text-sm text-muted-foreground mt-2">
              {formatDate(activity.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialActivityCard
