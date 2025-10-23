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
    <Card elevated interactive className="hover-lift transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Link to={`/profile/${activity.user?._id}`} className="group">
            <Avatar className="w-12 h-12 ring-2 ring-transparent group-hover:ring-primary transition-all">
              <AvatarImage src={activity.user?.avatar} />
              <AvatarFallback className="bg-gradient-primary text-white">{getInitials(activity.user?.name || 'User')}</AvatarFallback>
            </Avatar>
          </Link>
          
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {getActivityIcon(activity.type)}
                <Link to={`/profile/${activity.user?._id}`} className="font-semibold hover:text-primary transition-colors">
                  {activity.user?.name}
                </Link>
                <span className="text-muted-foreground">
                  {getActivityText(activity)}
                </span>
                {activity.movie && (
                  <Link to={`/movie/${activity.movie._id}`} className="font-semibold text-primary hover:text-primary/80 transition-colors">
                    "{activity.movie.title}"
                  </Link>
                )}
              </div>
            </div>

            {activity.rating && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-3">
                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-300">{activity.rating}/10</span>
              </div>
            )}

            {activity.movie?.poster && (
              <Link to={`/movie/${activity.movie._id}`} className="block group">
                <div className="relative w-32 h-48 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                  <img
                    src={activity.movie.poster}
                    alt={activity.movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            )}

            <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
              {formatDate(activity.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SocialActivityCard
