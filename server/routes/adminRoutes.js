import express from 'express'
import {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, admin)

router.get('/stats', getStats)
router.route('/users').get(getAllUsers)
router.route('/users/:id').put(updateUser).delete(deleteUser)

export default router
