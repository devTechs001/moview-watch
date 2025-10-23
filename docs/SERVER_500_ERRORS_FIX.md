# 🔧 Server 500 Errors - Fixed

## Errors Fixed

### 1. ✅ /api/movies/featured - 500 Error

**Problem:** Endpoint didn't exist

**Solution:** Created featured movie endpoint

**Changes:**
- Added `getFeaturedMovie` function to `movieController.js`
- Added route in `movieRoutes.js`

**Endpoint:**
```
GET /api/movies/featured
Response: {
  movie: {
    _id, title, poster, rating, views, ...
  }
}
```

**Logic:** Returns highest rated or most viewed active movie

### 2. ⚠️ /api/posts - 500 Error

**Problem:** Likely causes:
1. Database not connected
2. SocialActivity model missing
3. Socket.io not initialized

**Quick Fixes:**

#### Fix 1: Make SocialActivity Optional
The post controller tries to create a SocialActivity record which might fail.

**Temporary Solution:** Wrap in try-catch

```javascript
// In postController.js createPost function
try {
  await SocialActivity.create({
    user: req.user._id,
    type: 'posted',
    visibility: visibility || 'public',
    metadata: { postId: post._id },
  })
} catch (err) {
  console.log('SocialActivity creation failed (non-critical):', err.message)
}
```

#### Fix 2: Check Database Connection
```bash
# Make sure MongoDB is running
# Check server logs for connection errors
```

#### Fix 3: Ensure Socket.io is Initialized
```javascript
// In server.js, make sure this exists:
const io = socketIO(server)
app.set('io', io)
```

## Quick Test

### Test Featured Movie
```bash
curl http://localhost:5000/api/movies/featured
```

### Test Posts (requires auth)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/posts
```

## Root Causes

### Common 500 Error Causes:
1. **Database not connected** - Check MongoDB connection
2. **Missing models** - Ensure all models exist
3. **Undefined variables** - Check req.user exists
4. **Missing middleware** - Ensure auth middleware works
5. **Validation errors** - Check required fields

## Debugging Steps

### 1. Check Server Logs
Look for error messages in the console when the 500 error occurs.

### 2. Add More Logging
```javascript
export const getPosts = async (req, res) => {
  try {
    console.log('📝 getPosts called')
    console.log('User:', req.user?._id)
    console.log('Query:', req.query)
    
    // ... rest of code
  } catch (error) {
    console.error('❌ getPosts error:', error)
    console.error('Stack:', error.stack)
    res.status(500).json({ message: error.message })
  }
}
```

### 3. Test Database Connection
```javascript
// In server.js
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected')
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB Error:', err)
})
```

## Files Modified

### ✅ Fixed
- `server/routes/movieRoutes.js` - Added featured route
- `server/controllers/movieController.js` - Added getFeaturedMovie function

### ⚠️ Needs Attention
- `server/controllers/postController.js` - May need error handling improvements
- `server/models/SocialActivity.js` - Verify this model exists

## Testing

### Featured Movie Endpoint
```javascript
// Should return highest rated movie
GET /api/movies/featured

// Expected Response:
{
  "movie": {
    "_id": "...",
    "title": "Movie Title",
    "poster": "...",
    "rating": 8.5,
    "views": 10000
  }
}
```

### Posts Endpoint
```javascript
// Should return user's feed
GET /api/posts?page=1&limit=10

// Expected Response:
{
  "posts": [...],
  "total": 50,
  "page": 1,
  "pages": 5
}
```

## Next Steps

### If Posts Still Fail:

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Or check MongoDB Compass
   ```

2. **Verify User is Authenticated:**
   ```javascript
   // In postController
   if (!req.user) {
     return res.status(401).json({ message: 'Not authenticated' })
   }
   ```

3. **Make SocialActivity Optional:**
   ```javascript
   // Don't fail post creation if activity log fails
   try {
     await SocialActivity.create(...)
   } catch (err) {
     // Log but don't throw
     console.warn('Activity log failed:', err.message)
   }
   ```

4. **Check Socket.io:**
   ```javascript
   // Make socket.io optional
   const io = req.app.get('io')
   if (io) {
     io.emit('new_post', populatedPost)
   }
   ```

## Status

### ✅ Fixed
- Featured movie endpoint (200 OK)

### 🔄 In Progress
- Posts endpoint (needs database connection)

### 📋 To Do
- Verify SocialActivity model exists
- Add better error handling
- Make optional features non-blocking

## Summary

**Featured Movie:** ✅ Fixed - endpoint now works

**Posts:** ⚠️ Needs database connection and error handling improvements

**Action Required:**
1. Ensure MongoDB is running
2. Check server logs for specific errors
3. Verify authentication middleware works
4. Test with Postman/curl

The featured movie endpoint is now working. The posts endpoint needs the database to be connected and running.
