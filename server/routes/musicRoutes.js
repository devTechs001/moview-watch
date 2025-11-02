import express from 'express';
import { protect } from '../middleware/auth.js';
import musicController from '../controllers/musicController.js';

const router = express.Router();

// @route   GET /api/library/music
// @desc    Get all music
// @access  Private
router.get('/', protect, musicController.getMusic);

// @route   GET /api/library/music?genre=:genre
// @desc    Get music by genre
// @access  Private
router.get('/genre/:genre', protect, musicController.getMusicByGenre);

// @route   POST /api/library/music
// @desc    Add new music
// @access  Private
router.post('/', protect, musicController.addMusic);

// @route   PUT /api/library/music/:id
// @desc    Update music
// @access  Private
router.put('/:id', protect, musicController.updateMusic);

// @route   DELETE /api/library/music/:id
// @desc    Delete music
// @access  Private
router.delete('/:id', protect, musicController.deleteMusic);

export default router;