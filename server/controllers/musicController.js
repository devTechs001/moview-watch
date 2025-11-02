import Music from '../models/Music.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all music
// @route   GET /api/library/music
// @access  Private
const getMusic = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    sort = '-createdAt',
    search,
    genre
  } = req.query;

  const query = { status: 'active' };
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (genre) {
    query.genre = genre;
  }

  const music = await Music.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('addedBy', 'name avatar');

  const count = await Music.countDocuments(query);

  res.json({
    music,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// @desc    Get music by genre
// @route   GET /api/library/music/genre/:genre
// @access  Private
const getMusicByGenre = asyncHandler(async (req, res) => {
  const { genre } = req.params;
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const music = await Music.find({ 
    genre: genre,
    status: 'active'
  })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('addedBy', 'name avatar');

  const count = await Music.countDocuments({ genre: genre });

  res.json({
    music,
    totalPages: Math.ceil(count / limit),
    currentPage: page
  });
});

// @desc    Add new music
// @route   POST /api/library/music
// @access  Private
const addMusic = asyncHandler(async (req, res) => {
  const { 
    title,
    artist,
    album,
    genre,
    year,
    duration,
    cover,
    audioUrl
  } = req.body;

  const music = await Music.create({
    title,
    artist,
    album,
    genre,
    year,
    duration,
    cover,
    audioUrl,
    addedBy: req.user._id
  });

  res.status(201).json(music);
});

// @desc    Update music
// @route   PUT /api/library/music/:id
// @access  Private
const updateMusic = asyncHandler(async (req, res) => {
  const music = await Music.findById(req.params.id);

  if (!music) {
    res.status(404);
    throw new Error('Music not found');
  }

  // Check ownership or admin status
  if (music.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this music');
  }

  const updatedMusic = await Music.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedMusic);
});

// @desc    Delete music
// @route   DELETE /api/library/music/:id
// @access  Private
const deleteMusic = asyncHandler(async (req, res) => {
  const music = await Music.findById(req.params.id);

  if (!music) {
    res.status(404);
    throw new Error('Music not found');
  }

  // Check ownership or admin status
  if (music.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this music');
  }

  // Soft delete
  music.status = 'inactive';
  await music.save();

  res.json({ message: 'Music removed' });
});

export default {
  getMusic,
  getMusicByGenre,
  addMusic,
  updateMusic,
  deleteMusic
};