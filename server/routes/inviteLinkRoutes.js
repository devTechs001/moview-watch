import express from 'express'
import {
  createInviteLink,
  getInviteLinkDetails,
  useInviteLink,
  getUserInviteLinks,
  deactivateInviteLink,
  getInviteLinkStats,
  createPublicShareLink,
} from '../controllers/inviteLinkController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public routes (no auth required)
router.get('/:code/details', getInviteLinkDetails)

// Protected routes
router.use(protect)

router.post('/create', createInviteLink)
router.post('/:code/use', useInviteLink)
router.get('/my-links', getUserInviteLinks)
router.put('/:linkId/deactivate', deactivateInviteLink)
router.get('/:linkId/stats', getInviteLinkStats)
router.post('/share', createPublicShareLink)

export default router
