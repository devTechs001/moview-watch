import { Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/Avatar'
import { getInitials } from '../lib/utils'

const StoryCircle = ({ user, hasStory, isAddButton, onClick }) => {
  if (isAddButton) {
    return (
      <button onClick={onClick} className="flex-shrink-0">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-center mt-2">Add Story</p>
        </div>
      </button>
    )
  }

  return (
    <button onClick={onClick} className="flex-shrink-0">
      <div className="relative">
        <div className={`w-20 h-20 rounded-full p-1 ${
          hasStory 
            ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500' 
            : 'bg-muted'
        }`}>
          <Avatar className="w-full h-full border-4 border-background">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{getInitials(user?.name || 'User')}</AvatarFallback>
          </Avatar>
        </div>
        <p className="text-sm text-center mt-2 truncate w-20">{user?.name}</p>
      </div>
    </button>
  )
}

export default StoryCircle
