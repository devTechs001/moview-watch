import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getShorts, 
  createShort, 
  getShortById, 
  updateShort, 
  deleteShort, 
  likeShort, 
  recordView 
} from '../controllers/shortsController.js';

const router = express.Router();

router.route('/')
  .get(protect, getShorts)
  .post(protect, createShort);

router.route('/:id')
  .get(protect, getShortById)
  .put(protect, updateShort)
  .delete(protect, deleteShort);

router.route('/:id/like')
  .post(protect, likeShort);

router.route('/:id/view')
  .post(protect, recordView);

export default router;