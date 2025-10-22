import express from 'express'
import {
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addToHistory,
} from '../controllers/userController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/profile').get(protect, getProfile).put(protect, updateProfile)
router.route('/wishlist').get(protect, getWishlist)
router
  .route('/wishlist/:movieId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist)
router.post('/history/:movieId', protect, addToHistory)

export default router
