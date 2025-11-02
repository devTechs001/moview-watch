import Short from '../models/Short.js';
import asyncHandler from 'express-async-handler';
import axios from 'axios';

// @desc    Get all shorts with pagination and filters
// @route   GET /api/library/shorts
// @access  Private
const getShorts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skipIndex = (page - 1) * limit;
  
  const query = { status: 'published' };
  
  // Add filters if provided
  if (req.query.tags) {
    query.tags = { $in: req.query.tags.split(',') };
  }
  
  if (req.query.creator) {
    query.creator = req.query.creator;
  }

  const shorts = await Short.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skipIndex)
    .populate('uploader', 'name avatar')
    .populate('likes', 'name avatar');

  const total = await Short.countDocuments(query);

  res.json({
    shorts,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get a single short by ID
// @route   GET /api/library/shorts/:id
// @access  Private
const getShortById = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id)
    .populate('uploader', 'name avatar')
    .populate('likes', 'name avatar');

  if (!short) {
    res.status(404);
    throw new Error('Short not found');
  }

  res.json(short);
});

// @desc    Create a new short
// @route   POST /api/library/shorts
// @access  Private
const createShort = asyncHandler(async (req, res) => {
  const { title, description, videoUrl, thumbnail, duration, tags } = req.body;

  const short = await Short.create({
    title,
    description,
    videoUrl,
    thumbnail: thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
    duration,
    tags,
    uploader: req.user._id
  });

  res.status(201).json(short);
});

// @desc    Update a short
// @route   PUT /api/library/shorts/:id
// @access  Private
const updateShort = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id);

  if (!short) {
    res.status(404);
    throw new Error('Short not found');
  }

  // Check ownership
  if (short.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this short');
  }

  const updatedShort = await Short.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('creator', 'name avatar');

  res.json(updatedShort);
});

// @desc    Delete a short
// @route   DELETE /api/library/shorts/:id
// @access  Private
const deleteShort = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id);

  if (!short) {
    res.status(404);
    throw new Error('Short not found');
  }

  // Check ownership
  if (short.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this short');
  }

  await short.remove();
  res.json({ message: 'Short removed' });
});

// @desc    Like/Unlike a short
// @route   POST /api/library/shorts/:id/like
// @access  Private
const likeShort = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id);

  if (!short) {
    res.status(404);
    throw new Error('Short not found');
  }

  const isLiked = short.likes.includes(req.user._id);

  if (isLiked) {
    // Unlike
    short.likes = short.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
  } else {
    // Like
    short.likes.push(req.user._id);
  }

  await short.save();

  // Emit real-time update
  req.app.get('io').to(req.params.id).emit('shortLikeUpdate', {
    shortId: req.params.id,
    likes: short.likes.length,
    action: isLiked ? 'unlike' : 'like',
    userId: req.user._id
  });

  res.json(short);
});

// @desc    Record a view for a short
// @route   POST /api/library/shorts/:id/view
// @access  Private
const recordView = asyncHandler(async (req, res) => {
  const short = await Short.findById(req.params.id);

  if (!short) {
    res.status(404);
    throw new Error('Short not found');
  }

  short.views += 1;
  await short.save();

  // Emit real-time update
  req.app.get('io').emit('shortViewUpdate', {
    shortId: req.params.id,
    views: short.views
  });

  res.json({ views: short.views });
});

// @desc    Import shorts from external API (e.g., YouTube Shorts)
// @route   POST /api/library/shorts/import
// @access  Private/Admin
const importFromAPI = asyncHandler(async (req, res) => {
  const { apiSource, query } = req.body;
  
  // Example using YouTube API
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${query}&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
  );

  const shorts = [];
  for (const item of response.data.items) {
    const videoDetails = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${item.id.videoId}&key=${YOUTUBE_API_KEY}`
    );

    const short = await Short.create({
      title: item.snippet.title,
      description: item.snippet.description,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: parseDuration(videoDetails.data.items[0].contentDetails.duration),
      creator: req.user._id,
      source: 'api',
      tags: ['youtube', query],
      views: parseInt(videoDetails.data.items[0].statistics.viewCount)
    });

    shorts.push(short);
  }

  res.status(201).json(shorts);
});

// Helper function to parse YouTube duration format
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+M)?(\d+S)?/);
  const minutes = (match[1] ? parseInt(match[1].slice(0, -1)) : 0);
  const seconds = (match[2] ? parseInt(match[2].slice(0, -1)) : 0);
  return minutes * 60 + seconds;
};

export {
  getShorts,
  getShortById,
  createShort,
  updateShort,
  deleteShort,
  likeShort,
  recordView,
  importFromAPI
};