import asyncHandler from 'express-async-handler';

// Fallback image URLs
const FALLBACK_IMAGES = {
  poster: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  backdrop: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  avatar: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
};

// Check if image URL is accessible
async function isImageAccessible(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Replace broken image URLs with fallbacks
const handleBrokenImages = asyncHandler(async (req, res, next) => {
  if (!req.body) return next();

  const fields = ['poster', 'backdrop', 'avatar', 'thumbnail'];
  
  for (const field of fields) {
    if (req.body[field]) {
      const isAccessible = await isImageAccessible(req.body[field]);
      if (!isAccessible) {
        req.body[field] = FALLBACK_IMAGES[field];
      }
    }
  }

  next();
});

export { handleBrokenImages, FALLBACK_IMAGES };