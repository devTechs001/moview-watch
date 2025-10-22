import express from 'express'
import {
  createStory,
  getStories,
  viewStory,
  likeStory,
  getSocialFeed,
  createActivity,
  getUserSocialProfile,
} from '../controllers/socialController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.route('/stories').get(getStories).post(createStory)
router.post('/stories/:id/view', viewStory)
router.post('/stories/:id/like', likeStory)

router.route('/feed').get(getSocialFeed)
router.post('/activity', createActivity)
router.get('/profile/:userId', getUserSocialProfile)

export default router
