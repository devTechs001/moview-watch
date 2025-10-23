import express from 'express'
import {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getActivity,
  getReports,
  updateReport,
} from '../controllers/adminController.js'
import { protect, adminOnly } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, adminOnly)

router.get('/stats', getStats)
router.route('/users').get(getAllUsers)
router.route('/users/:id').put(updateUser).delete(deleteUser)
router.get('/activity', getActivity)
router.get('/reports', getReports)
router.put('/reports/:id', updateReport)

export default router
