import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Mail, MapPin, Calendar, Film, Heart, MessageCircle, UserPlus, UserMinus, Settings, Edit2, Share2, MoreVertical, Users, Star } from 'lucide-react'
import Layout from '../components/Layout'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { useAuthStore } from '../store/authStore'
import { getInitials, formatNumber } from '../lib/utils'
import MovieCard from '../components/MovieCard'
import MediaUpload from '../components/MediaUpload'
import axios from '../lib/axios'
import toast from 'react-hot-toast'

const EnhancedProfilePage = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [user, setUser] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showMediaUpload, setShowMediaUpload] = useState(false)
  const [uploadType, setUploadType] = useState(null) // 'avatar' or 'cover'
  const [activeTab, setActiveTab] = useState('posts') // 'posts', 'movies', 'reviews', 'photos'
  const [loading, setLoading] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
  })

  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    moviesWatched: 0,
    reviews: 0,
  })

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const targetUserId = userId || currentUser?._id
      const response = await axios.get(`/users/${targetUserId}`)
      setUser(response.data.user)
      setIsOwnProfile(!userId || userId === currentUser?._id)
      setIsFollowing(response.data.user.followers?.includes(currentUser?._id))
      setStats(response.data.stats || stats)
      setFormData({
        name: response.data.user.name || '',
        username: response.data.user.username || '',
        bio: response.data.user.bio || '',
        location: response.data.user.location || '',
        website: response.data.user.website || '',
      })
    } catch (error) {
      // Use current user if API fails
      setUser(currentUser)
      setIsOwnProfile(true)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    try {
      await axios.post(`/users/${user._id}/follow`)
      setIsFollowing(!isFollowing)
      setStats(prev => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1
      }))
      toast.success(isFollowing ? 'Unfollowed' : 'Following!')
    } catch (error) {
      toast.error('Failed to update follow status')
    }
  }

  const handleMessage = () => {
    navigate(`/chat/${user._id}`)
  }

  const handleMediaSelect = async (file, type) => {
    try {
      const formData = new FormData()
      formData.append(uploadType === 'avatar' ? 'avatar' : 'coverImage', file)
      
      const response = await axios.put('/users/profile/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setUser(response.data.user)
      toast.success(`${uploadType === 'avatar' ? 'Profile' : 'Cover'} photo updated!`)
    } catch (error) {
      toast.error('Failed to upload image')
    }
    setShowMediaUpload(false)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.put('/users/profile', formData)
      setUser(response.data.user)
      setIsEditing(false)
      toast.success('Profile updated!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${user._id}`
    if (navigator.share) {
      navigator.share({
        title: `${user.name}'s Profile`,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Profile link copied!')
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Cover Image */}
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary to-accent">
          {user?.coverImage && (
            <img 
              src={user.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => {
                setUploadType('cover')
                setShowMediaUpload(true)
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Edit Cover
            </Button>
          )}
        </div>

        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <div className="relative -mt-20 mb-8">
            <Card elevated>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="text-4xl bg-gradient-primary text-white">
                        {getInitials(user?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    {isOwnProfile && (
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 rounded-full shadow-lg"
                        onClick={() => {
                          setUploadType('avatar')
                          setShowMediaUpload(true)
                        }}
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-1">{user?.name}</h1>
                        {user?.username && (
                          <p className="text-muted-foreground mb-2">@{user.username}</p>
                        )}
                        {user?.bio && (
                          <p className="text-foreground mb-3 max-w-2xl">{user.bio}</p>
                        )}
                        
                        {/* User Details */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {user?.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          {user?.website && (
                            <a 
                              href={user.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <Film className="w-4 h-4" />
                              <span>{user.website}</span>
                            </a>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {isOwnProfile ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditing(!isEditing)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => navigate('/settings')}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={handleFollow}
                              variant={isFollowing ? 'outline' : 'default'}
                            >
                              {isFollowing ? (
                                <><UserMinus className="w-4 h-4 mr-2" /> Unfollow</>
                              ) : (
                                <><UserPlus className="w-4 h-4 mr-2" /> Follow</>
                              )}
                            </Button>
                            <Button variant="outline" onClick={handleMessage}>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleShare}>
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mt-6 pt-6 border-t">
                      <button className="hover:text-primary transition-colors">
                        <div className="text-2xl font-bold">{formatNumber(stats.posts)}</div>
                        <div className="text-sm text-muted-foreground">Posts</div>
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <div className="text-2xl font-bold">{formatNumber(stats.followers)}</div>
                        <div className="text-sm text-muted-foreground">Followers</div>
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <div className="text-2xl font-bold">{formatNumber(stats.following)}</div>
                        <div className="text-sm text-muted-foreground">Following</div>
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <div className="text-2xl font-bold">{formatNumber(stats.moviesWatched)}</div>
                        <div className="text-sm text-muted-foreground">Movies</div>
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <div className="text-2xl font-bold">{formatNumber(stats.reviews)}</div>
                        <div className="text-sm text-muted-foreground">Reviews</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                  <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Username</label>
                        <Input
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full p-3 rounded-lg border-2 border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows="3"
                        maxLength="160"
                        placeholder="Tell us about yourself..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/160</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <Input
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b overflow-x-auto">
              {['posts', 'movies', 'reviews', 'photos'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="pb-12">
            {activeTab === 'posts' && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            )}
            
            {activeTab === 'movies' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }, (_, i) => ({
                  _id: i + 1,
                  title: `Movie ${i + 1}`,
                  poster: `https://picsum.photos/seed/movie${i}/300/450`,
                  year: 2024,
                  genre: ['Action'],
                  rating: 8.5,
                  likes: 1000,
                  views: 50000,
                })).map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img 
                          src={`https://picsum.photos/seed/review${i}/100/150`}
                          alt="Movie"
                          className="w-20 h-30 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">Movie Title {i + 1}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            {Array.from({ length: 5 }, (_, j) => (
                              <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="text-muted-foreground">
                            Great movie! The cinematography was stunning and the plot kept me engaged throughout.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {activeTab === 'photos' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                    <img 
                      src={`https://picsum.photos/seed/photo${i}/400/400`}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Media Upload Modal */}
        {showMediaUpload && (
          <MediaUpload
            onMediaSelect={handleMediaSelect}
            onClose={() => setShowMediaUpload(false)}
          />
        )}
      </div>
    </Layout>
  )
}

export default EnhancedProfilePage
