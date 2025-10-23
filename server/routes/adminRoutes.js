import express from 'express'
import {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getActivity,
  getReports,
  updateReport,
  getComments,
  getCommentStats,
  flagComment,
  approveComment,
  deleteComment,
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
router.get('/comments', getComments)
router.get('/comments/stats', getCommentStats)
router.put('/comments/:id/flag', flagComment)
router.put('/comments/:id/approve', approveComment)
router.delete('/comments/:id', deleteComment)

export default router
