import express from 'express'
import {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, adminOnly)

router.get('/stats', getStats)
router.route('/users').get(getAllUsers)
router.route('/users/:id').put(updateUser).delete(deleteUser)

export default router
